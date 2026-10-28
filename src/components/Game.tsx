import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { AIDifficulty } from '../ai';
import { BRAND_MASCOTS } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES } from '../data/rps';
import { audio } from '../utils/audio';
import { GameEngine, GameState } from '../utils/engine';
import { LandmarkPoint } from '../utils/gesture';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';
import { TenRoundProgressBar } from './TenRoundProgressBar';

const MAX_CANVAS_PIXEL_RATIO = 1.5;
const MAX_FRAME_DELTA_MS = 50;
const MAX_PHYSICS_STEP_MS = 1000 / 120;
const UI_STATE_PUBLISH_INTERVAL_MS = 75;

interface GameProps {
  profile: PlayerProfile;
  demoMode: boolean;
  difficulty?: AIDifficulty;
  onGameOver: (state: GameState) => void;
  onStateUpdate: (state: GameState) => void;
}

export function Game({ profile, demoMode, difficulty = 'normal', onGameOver, onStateUpdate }: GameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastHandDetectMsRef = useRef<number>(0);
  const cachedLandmarksRef = useRef<LandmarkPoint[] | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelRatioRef = useRef(1);
  const finishedRef = useRef(false);
  const onGameOverRef = useRef(onGameOver);
  const onStateUpdateRef = useRef(onStateUpdate);

  onGameOverRef.current = onGameOver;
  onStateUpdateRef.current = onStateUpdate;

  const [isLoading, setIsLoading] = useState(!demoMode);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [engineState, setEngineState] = useState<GameState | null>(null);

  const selectedChar = getCharacterById(profile.characterId);

  // Giải phóng phần cứng camera & AI model
  const stopCamera = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = 0;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn('Lỗi dừng camera track:', e);
      }
      mediaStreamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      try {
        if (video.srcObject) {
          (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
          video.srcObject = null;
        }
        video.pause();
      } catch {
        // ignore
      }
    }

    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close();
      } catch (e) {
        console.warn('Lỗi đóng landmarker:', e);
      }
      landmarkerRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let lastPublishedAt = -Infinity;
    finishedRef.current = false;

    engineRef.current = new GameEngine((state) => {
      const now = performance.now();
      if (now - lastPublishedAt >= UI_STATE_PUBLISH_INTERVAL_MS || state.phase !== engineState?.phase) {
        lastPublishedAt = now;
        setEngineState(state);
        onStateUpdateRef.current(state);
      }

      if (state.isGameOver && !finishedRef.current) {
        finishedRef.current = true;
        stopCamera();
        onGameOverRef.current(state);
      }
    }, difficulty);

    const init = async () => {
      audio.init();
      if (!active) return;

      if (demoMode) {
        setIsLoading(false);
        startGameLoop();
        return;
      }

      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        if (!active || finishedRef.current) return;

        // Chỉ nhận diện 1 bàn tay duy nhất theo yêu cầu
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1, // 1 tay duy nhất
          minHandDetectionConfidence: 0.55,
          minHandPresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 540 } },
          audio: false,
        });

        if (!active || finishedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!active || finishedRef.current) {
              stopCamera();
              return;
            }
            videoRef.current?.play().catch(() => undefined);
            setCameraReady(true);
            setIsLoading(false);
            startGameLoop();
          };
        }
      } catch (err) {
        console.warn('Lỗi mở camera, chuyển sang chế độ chuột:', err);
        setCameraError('Không mở được camera. Trò chơi đã chuyển sang chế độ phím bấm / chuột dự phòng.');
        setIsLoading(false);
        startGameLoop();
      }
    };

    init();

    return () => {
      active = false;
      stopCamera();
    };
  }, [demoMode, stopCamera]);

  const startGameLoop = () => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (finishedRef.current) return;

      const canvas = canvasRef.current;
      const container = containerRef.current;
      const engine = engineRef.current;
      if (!canvas || !container || !engine) return;

      const frameDt = Math.max(0, Math.min(MAX_FRAME_DELTA_MS, currentTime - lastTime));
      lastTime = currentTime;

      const logicalWidth = Math.max(1, container.clientWidth);
      const logicalHeight = Math.max(1, container.clientHeight);
      const pixelRatio = Math.min(MAX_CANVAS_PIXEL_RATIO, Math.max(1, window.devicePixelRatio || 1));
      const targetWidth = Math.max(1, Math.floor(logicalWidth * pixelRatio));
      const targetHeight = Math.max(1, Math.floor(logicalHeight * pixelRatio));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        pixelRatioRef.current = pixelRatio;
        ctxRef.current = canvas.getContext('2d', {
          alpha: true,
          desynchronized: true,
        } as CanvasRenderingContext2DSettings);
        engine.resize(logicalWidth, logicalHeight);
      }

      const ctx = ctxRef.current || canvas.getContext('2d', { alpha: true, desynchronized: true } as CanvasRenderingContext2DSettings);
      if (!ctx) return;
      ctxRef.current = ctx;

      // Cập nhật tay từ Camera MediaPipe (1 tay duy nhất)
      const handLandmarks = demoMode || cameraError ? null : getCameraHandLandmarks();
      if (!demoMode && !cameraError) {
        engine.updateHand(handLandmarks);
      }

      let remainingDt = frameDt;
      while (remainingDt > 0) {
        const physicsDt = Math.min(MAX_PHYSICS_STEP_MS, remainingDt);
        engine.update(physicsDt);
        remainingDt -= physicsDt;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(pixelRatioRef.current, 0, 0, pixelRatioRef.current, 0, 0);
      engine.draw(ctx);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
  };

  const getCameraHandLandmarks = (): LandmarkPoint[] | null => {
    if (finishedRef.current) return null;
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const container = containerRef.current;
    if (!video || !landmarker || !container || video.readyState < 2) return cachedLandmarksRef.current;

    const now = performance.now();
    if (now - lastHandDetectMsRef.current < 25) return cachedLandmarksRef.current;
    if (lastVideoTimeRef.current === video.currentTime) return cachedLandmarksRef.current;

    lastVideoTimeRef.current = video.currentTime;
    lastHandDetectMsRef.current = now;

    let results: HandLandmarkerResult | null = null;
    try {
      results = landmarker.detectForVideo(video, now);
    } catch {
      return cachedLandmarksRef.current;
    }

    if (!results?.landmarks?.length) {
      cachedLandmarksRef.current = null;
      return null;
    }

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    // Map 21 landmarks sang tọa độ canvas lật gương
    const firstHand = results.landmarks[0];
    const mapped: LandmarkPoint[] = firstHand.map((pt) => ({
      x: (1 - pt.x) * cw,
      y: pt.y * ch,
      z: pt.z,
    }));

    cachedLandmarksRef.current = mapped;
    return cachedLandmarksRef.current;
  };

  const currentPhase = engineState?.phase || 'COUNTDOWN';
  const chantWord = engineState?.chantWord || 'OẲN';
  const gapCountdown = Math.max(0, Math.ceil(engineState?.gapCountdown || 5));

  // Nhận diện thế tay người chơi (thời gian thực lúc đếm ngược, hoặc chốt lúc phân định)
  const activePlayerGesture =
    currentPhase === 'SHOWDOWN' ? engineState?.playerChoice : engineState?.liveGesture;

  // Chiêu thức bên máy: nhảy random liên tục lúc đếm ngược, chốt lúc showdown
  const activeAIChoice =
    currentPhase === 'SHOWDOWN' && engineState?.aiChoice
      ? engineState.aiChoice
      : engineState?.shufflingAIChoice || 'rock';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#030714]"
      style={{ transform: 'none' }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050A1C]/95 backdrop-blur-md">
          <img className="w-24 h-24 object-contain animate-bounce mb-3" src={BRAND_MASCOTS.cameraLoadingAnimated} alt="" />
          <div className="w-12 h-12 border-4 border-[#00D89A] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-white font-black text-base sm:text-lg">ĐANG KẾT NỐI CAMERA & AR MODEL...</p>
          <span className="text-[#00D89A] text-xs font-bold mt-1">Sử dụng Skeleton AR để xét Kéo - Búa - Bao</span>
        </div>
      )}

      {/* Camera Error warning */}
      {cameraError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl bg-rose-500/25 border border-rose-500 text-rose-200 text-xs font-bold shadow-lg max-w-lg text-center backdrop-blur-md">
          <span>⚠️ {cameraError}. Vui lòng cho phép quyền Camera để trải nghiệm Oẳn Tù Xì AR.</span>
        </div>
      )}

      {/* Video Webcam Stream - Nền mờ phía sau */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 w-full h-full -scale-x-100 object-cover opacity-25 mix-blend-screen pointer-events-none ${
          cameraReady ? '' : 'hidden'
        }`}
      />

      {/* Main Canvas rendering AR Hand Skeleton & VFX */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* ============================================================ */}
      {/* ARENA INTERACTION LAYER                                      */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-4 pointer-events-none">
        {/* Top Battle Info Bar + 10-Round Status Bar */}
        <div className="flex flex-col gap-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between gap-2 w-full">
            {/* Player Card */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[#08122c]/85 border border-[#38BDF8]/40 shadow-lg backdrop-blur-md">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A] p-0.5 shrink-0">
                <CharacterAvatar character={selectedChar} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Người Chơi</span>
                <span className="text-xs sm:text-sm font-black text-white truncate max-w-[110px] sm:max-w-[160px]">
                  {profile.groupName}
                </span>
                <span className="text-[10px] text-[#00D89A] font-bold">Lớp: {profile.className}</span>
              </div>
            </div>

            {/* Central Round Badge */}
            <div className="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md">
              <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/80">
                <span className="text-[#38BDF8]">VÒNG {engineState?.round || 1}/2</span>
                <span>•</span>
                <span className="text-[#FBBF24]">LƯỢT {engineState?.turn || 1}/5</span>
              </div>
              <span className="text-[9px] text-[#00D89A] font-mono font-bold">
                Điểm: {engineState?.score || 0}
              </span>
            </div>

            {/* AI Opponent Card */}
            <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[#08122c]/85 border border-[#EF4444]/40 shadow-lg backdrop-blur-md">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Đối Thủ</span>
                <span className="text-xs sm:text-sm font-black text-[#EF4444]">MANABIE AI</span>
                <span className="text-[10px] text-white/60 font-semibold">Tự động ngẫu nhiên</span>
              </div>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#EF4444]/30 to-[#F59E0B]/30 border border-[#EF4444] flex items-center justify-center text-xl shrink-0">
                🤖
              </div>
            </div>
          </div>

          {/* Thanh 10 Vòng Đấu: Thắng máy tô xanh, thua máy tô đỏ, hòa tô vàng */}
          <div className="w-full flex justify-center">
            <TenRoundProgressBar
              history={engineState?.history || []}
              currentRound={engineState?.round || 1}
              currentTurn={engineState?.turn || 1}
              phase={currentPhase}
            />
          </div>
        </div>

        {/* Center Arena Clash Zone: Bên Người vs Bên Máy */}
        <div className="my-auto max-w-4xl mx-auto w-full flex items-center justify-between gap-3 sm:gap-6 px-2">
          {/* ======================================================== */}
          {/* 1. BÊN NGƯỜI (Player Side - Nhận diện AR thời gian thực) */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#38BDF8]/40 mb-2 backdrop-blur-md">
              <span className="text-[10px] sm:text-xs font-black uppercase text-[#38BDF8] tracking-wider">
                🖐️ BẠN (AR CAMERA)
              </span>
            </div>

            {/* Khung hiển thị chiêu thức: Lắc lên xuống nhẹ (animate-rps-bob-player) */}
            <div
              className={`relative w-28 h-36 sm:w-48 sm:h-56 rounded-3xl p-3 flex flex-col items-center justify-center border-2 transition-all duration-200 ${
                activePlayerGesture
                  ? 'animate-rps-bob-player shadow-2xl backdrop-blur-md'
                  : 'border-dashed border-white/20 bg-white/5 animate-pulse'
              }`}
              style={{
                borderColor: activePlayerGesture
                  ? RPS_CHOICES[activePlayerGesture].borderColor
                  : 'rgba(255,255,255,0.2)',
                backgroundColor: activePlayerGesture
                  ? RPS_CHOICES[activePlayerGesture].bgColor
                  : 'rgba(0,0,0,0.4)',
                boxShadow: activePlayerGesture
                  ? `0 0 35px ${RPS_CHOICES[activePlayerGesture].borderColor}40`
                  : 'none',
              }}
            >
              {activePlayerGesture ? (
                <>
                  <img
                    src={RPS_CHOICES[activePlayerGesture].image}
                    alt={activePlayerGesture}
                    className="w-20 h-20 sm:w-32 sm:h-32 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform -scale-x-100"
                  />
                  <span className="text-xs sm:text-base font-black text-white mt-1 uppercase tracking-wider">
                    {RPS_CHOICES[activePlayerGesture].emoji} {RPS_CHOICES[activePlayerGesture].vietnameseName}
                  </span>
                  <span className="text-[9px] text-[#00D89A] font-bold">✓ Nhận diện bàn tay</span>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-2">
                  <span className="text-3xl sm:text-5xl opacity-40 mb-1">✋</span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/60 leading-tight">
                    Giơ 1 tay trước camera<br />
                    (✊ Búa / ✌️ Kéo / ✋ Bao)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. KHU VỰC TRUNG TÂM (Chant OẲN - TÙ - XÌ & Kết quả)      */}
          {/* ======================================================== */}
          <div className="shrink-0 flex flex-col items-center justify-center text-center min-w-[130px] sm:min-w-[190px]">
            {currentPhase === 'COUNTDOWN' && (
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-white/50 uppercase mb-1">
                  ĐẾM NHỊP
                </span>

                {/* Chữ OẲN - TÙ - XÌ to nổi bật */}
                <div
                  className={`font-black font-mono leading-none tracking-wider text-5xl sm:text-8xl drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-all duration-150 ${
                    chantWord === 'OẲN'
                      ? 'text-[#F59E0B] scale-100'
                      : chantWord === 'TÙ'
                      ? 'text-[#38BDF8] scale-110'
                      : 'text-[#EF4444] scale-125'
                  }`}
                >
                  {chantWord}
                </div>

                <div className="mt-2 text-[10px] sm:text-xs font-bold text-white/70 font-mono">
                  {Math.max(0, engineState?.countdownSeconds || 0).toFixed(1)}s
                </div>
              </div>
            )}

            {currentPhase === 'SHOWDOWN' && (
              <div className="flex flex-col items-center gap-2 animate-banner-pop">
                <span
                  className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider ${
                    engineState?.lastResult === 'win'
                      ? 'bg-[#10B981] text-[#022318] shadow-[0_0_20px_rgba(16,185,129,0.7)]'
                      : engineState?.lastResult === 'draw'
                      ? 'bg-[#F59E0B] text-[#022318] shadow-[0_0_20px_rgba(245,158,11,0.7)]'
                      : 'bg-[#EF4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                  }`}
                >
                  {engineState?.resultMessage}
                </span>
                <span className="text-xl sm:text-3xl font-black font-mono text-white/40 italic">VS</span>
                <span className="text-[11px] sm:text-xs text-white/90 font-bold max-w-[170px] leading-tight">
                  {engineState?.resultDetail}
                </span>
              </div>
            )}

            {currentPhase === 'ROUND_GAP' && (
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#09153a]/95 border-2 border-[#00D89A] shadow-[0_0_40px_rgba(0,216,154,0.4)] animate-modal-dialog">
                <span className="text-[9px] font-black uppercase text-[#00D89A]">NGHỈ CHUYỂN VÒNG</span>
                <span className="text-3xl sm:text-5xl font-black font-mono text-[#00D89A] animate-pulse">
                  {gapCountdown}s
                </span>
                <span className="text-[10px] text-white/80 font-bold">Người chơi 2 chuẩn bị</span>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. BÊN MÁY (AI Side - Nhảy random trong lúc đếm ngược)    */}
          {/* ======================================================== */}
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#EF4444]/40 mb-2 backdrop-blur-md">
              <span className="text-[10px] sm:text-xs font-black uppercase text-[#EF4444] tracking-wider">
                🤖 MANABIE AI
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                  (engineState?.difficulty || difficulty) === 'hard'
                    ? 'bg-rose-500/25 border border-rose-500/50 text-rose-300'
                    : (engineState?.difficulty || difficulty) === 'easy'
                    ? 'bg-emerald-500/25 border border-emerald-500/50 text-emerald-300'
                    : 'bg-sky-500/25 border border-sky-500/50 text-sky-300'
                }`}
              >
                {(engineState?.difficulty || difficulty) === 'hard'
                  ? 'Khó'
                  : (engineState?.difficulty || difficulty) === 'easy'
                  ? 'Dễ'
                  : 'Thường'}
              </span>
            </div>

            {/* AI Status Label - Trừu tượng hóa quá trình học */}
            <div className="mb-1 text-[10px] text-white/60 font-semibold tracking-wide flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
              <span>{engineState?.aiStatusLabel || 'Đang quan sát'}</span>
            </div>

            {/* Khung hiển thị chiêu thức máy: Lắc lên xuống nhẹ (animate-rps-bob-ai) */}
            <div
              className={`relative w-28 h-36 sm:w-48 sm:h-56 rounded-3xl p-3 flex flex-col items-center justify-center border-2 transition-all duration-200 animate-rps-bob-ai shadow-2xl backdrop-blur-md`}
              style={{
                borderColor: RPS_CHOICES[activeAIChoice].borderColor,
                backgroundColor: RPS_CHOICES[activeAIChoice].bgColor,
                boxShadow: `0 0 35px ${RPS_CHOICES[activeAIChoice].borderColor}40`,
              }}
            >
              <img
                src={RPS_CHOICES[activeAIChoice].image}
                alt={activeAIChoice}
                className="w-20 h-20 sm:w-32 sm:h-32 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
              />
              <span className="text-xs sm:text-base font-black text-white mt-1 uppercase tracking-wider">
                {currentPhase === 'SHOWDOWN'
                  ? `${RPS_CHOICES[activeAIChoice].emoji} ${RPS_CHOICES[activeAIChoice].vietnameseName}`
                  : '🎲 ĐANG CHỌN...'}
              </span>
              <span className="text-[9px] text-[#F59E0B] font-bold">
                {currentPhase === 'SHOWDOWN' ? '✓ Chiêu thức đã chốt' : '⚡ Nhảy ngẫu nhiên'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Mascot Coach Guide - Chơi thuần AR */}
        <div className="max-w-5xl mx-auto w-full flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-md max-w-lg">
            <img className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0" src={BRAND_MASCOTS.explore} alt="" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-[#00D89A] uppercase tracking-wider">
                Quy Tắc Oẳn Tù Xì AR (1 Bàn Tay)
              </span>
              <p className="text-[11px] sm:text-xs text-white/80 leading-snug">
                ✊ <b>Búa đập Kéo</b> • ✌️ <b>Kéo cắt Bao</b> • ✋ <b>Bao bọc Búa</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
