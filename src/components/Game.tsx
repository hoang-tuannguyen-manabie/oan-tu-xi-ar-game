import { useCallback, useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { BRAND_MASCOTS } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES } from '../data/rps';
import { audio } from '../utils/audio';
import { GameEngine, GameState } from '../utils/engine';
import { LandmarkPoint } from '../utils/gesture';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

const MAX_CANVAS_PIXEL_RATIO = 1.5;
const MAX_FRAME_DELTA_MS = 50;
const MAX_PHYSICS_STEP_MS = 1000 / 120;
const UI_STATE_PUBLISH_INTERVAL_MS = 75;

interface GameProps {
  profile: PlayerProfile;
  demoMode: boolean;
  onGameOver: (state: GameState) => void;
  onStateUpdate: (state: GameState) => void;
}

export function Game({ profile, demoMode, onGameOver, onStateUpdate }: GameProps) {
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
    });

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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-[#030714]"
      style={{
        transform: engineState?.screenShake && engineState.screenShake > 0.5
          ? `translate3d(${(Math.random() - 0.5) * engineState.screenShake * 1.5}px, ${(Math.random() - 0.5) * engineState.screenShake * 1.5}px, 0)`
          : 'none',
      }}
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

      {/* Camera Error / Mouse fallback warning */}
      {cameraError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-bold shadow-lg max-w-lg text-center backdrop-blur-md">
          <span>⚠️ {cameraError} (Dùng 3 nút bấm bên dưới để ra chiêu)</span>
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
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 pointer-events-none">
        {/* Top Battle Info Bar */}
        <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
          {/* Player Card */}
          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[#08122c]/85 border border-[#38BDF8]/40 shadow-lg backdrop-blur-md">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A] p-0.5 shrink-0">
              <CharacterAvatar character={selectedChar} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Người Chơi</span>
              <span className="text-xs sm:text-sm font-black text-white truncate max-w-[120px] sm:max-w-[160px]">
                {profile.groupName}
              </span>
              <span className="text-[10px] text-[#00D89A] font-bold">Lớp: {profile.className}</span>
            </div>
          </div>

          {/* Central Turn & Round Badge */}
          <div className="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/70">
              <span className="text-[#38BDF8]">VÒNG {engineState?.round || 1}/2</span>
              <span>•</span>
              <span className="text-[#FBBF24]">LƯỢT {engineState?.turn || 1}/5</span>
            </div>
            <span className="text-[10px] text-white/40">Tổng 10 lượt đấu</span>
          </div>

          {/* AI Opponent Card */}
          <div className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[#08122c]/85 border border-[#EF4444]/40 shadow-lg backdrop-blur-md">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Đối Thủ</span>
              <span className="text-xs sm:text-sm font-black text-[#EF4444]">MANABIE AI</span>
              <span className="text-[10px] text-white/60 font-semibold">Tự động ngẫu nhiên</span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#EF4444]/30 to-[#F59E0B]/30 border border-[#EF4444] flex items-center justify-center text-xl shrink-0">
              🤖
            </div>
          </div>
        </div>

        {/* Center Arena Clash Zone */}
        <div className="my-auto flex flex-col items-center justify-center text-center">
          {currentPhase === 'COUNTDOWN' && (
            <div className="flex flex-col items-center justify-center animate-pulse">
              <span className="text-xs sm:text-sm font-black tracking-widest text-white/60 uppercase mb-1">
                Chuẩn Bị Ra Chiêu (1 Bàn Tay)
              </span>

              {/* Chữ OẲN - TÙ - XÌ to nổi bật có hiệu ứng rung giật */}
              <div
                className={`font-black font-mono leading-none tracking-wider text-5xl sm:text-8xl drop-shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-transform ${
                  chantWord === 'OẲN'
                    ? 'text-[#F59E0B] scale-100'
                    : chantWord === 'TÙ'
                    ? 'text-[#38BDF8] scale-110'
                    : 'text-[#EF4444] scale-125'
                }`}
              >
                {chantWord}
              </div>

              <div className="mt-3 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 text-white/80 text-xs font-bold backdrop-blur-md flex items-center gap-2">
                <span>⏱️</span>
                <span>Hết đếm ngược hệ thống sẽ <b>ghi nhận tư thế tay sau cùng</b>!</span>
              </div>
            </div>
          )}

          {currentPhase === 'SHOWDOWN' && (
            <div className="flex flex-col items-center gap-3 sm:gap-4 max-w-xl w-full p-4 sm:p-6 rounded-3xl bg-[#08122c]/90 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-banner-pop">
              {/* Showdown Result Badge */}
              <div
                className={`px-4 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider ${
                  engineState?.lastResult === 'win'
                    ? 'bg-[#10B981] text-[#022318] shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : engineState?.lastResult === 'draw'
                    ? 'bg-[#F59E0B] text-[#022318] shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-[#EF4444] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                }`}
              >
                {engineState?.resultMessage}
              </div>

              {/* Clash cards: Player Choice vs AI Choice */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 w-full my-1">
                {/* Player Card */}
                {engineState?.playerChoice && (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white/60 uppercase">Tay Của Bạn</span>
                    <div
                      className="w-20 h-24 sm:w-28 sm:h-32 rounded-2xl flex flex-col items-center justify-center p-2 border-2 shadow-xl transform -rotate-3 transition-transform"
                      style={{
                        borderColor: RPS_CHOICES[engineState.playerChoice].borderColor,
                        backgroundColor: RPS_CHOICES[engineState.playerChoice].bgColor,
                      }}
                    >
                      <img
                        src={RPS_CHOICES[engineState.playerChoice].image}
                        alt={engineState.playerChoice}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                      />
                      <span className="text-xs sm:text-sm font-black text-white mt-1">
                        {RPS_CHOICES[engineState.playerChoice].vietnameseName}
                      </span>
                    </div>
                  </div>
                )}

                <span className="text-2xl sm:text-4xl font-black font-mono text-white/40 italic">VS</span>

                {/* AI Card */}
                {engineState?.aiChoice && (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white/60 uppercase">Chiêu Của AI</span>
                    <div
                      className="w-20 h-24 sm:w-28 sm:h-32 rounded-2xl flex flex-col items-center justify-center p-2 border-2 shadow-xl transform rotate-3 transition-transform"
                      style={{
                        borderColor: RPS_CHOICES[engineState.aiChoice].borderColor,
                        backgroundColor: RPS_CHOICES[engineState.aiChoice].bgColor,
                      }}
                    >
                      <img
                        src={RPS_CHOICES[engineState.aiChoice].image}
                        alt={engineState.aiChoice}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                      />
                      <span className="text-xs sm:text-sm font-black text-white mt-1">
                        {RPS_CHOICES[engineState.aiChoice].vietnameseName}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-white/80 font-bold">{engineState?.resultDetail}</p>
            </div>
          )}

          {/* GAP 5 GIÂY NGHỈ GIỮA VÒNG 1 VÀ VÒNG 2 */}
          {currentPhase === 'ROUND_GAP' && (
            <div className="flex flex-col items-center gap-3 p-5 sm:p-8 rounded-3xl bg-[#09153a]/95 border-2 border-[#00D89A] shadow-[0_0_60px_rgba(0,216,154,0.4)] backdrop-blur-2xl max-w-lg w-full animate-modal-dialog">
              <span className="px-3 py-1 rounded-full bg-[#00D89A]/20 text-[#00D89A] text-xs font-black uppercase tracking-wider">
                ✓ HOÀN THÀNH VÒNG 1
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white text-center">
                CHUẨN BỊ BƯỚC VÀO VÒNG 2!
              </h2>
              <p className="text-xs sm:text-sm text-white/70 text-center leading-relaxed">
                Khoảng nghỉ <b>5 giây</b> để <b>người chơi 2 / lượt đấu kế tiếp</b> sẵn sàng trước camera!
              </p>

              {/* Vòng tròn đếm ngược 5s */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#00D89A] flex items-center justify-center text-4xl sm:text-5xl font-black font-mono text-[#00D89A] shadow-[0_0_30px_rgba(0,216,154,0.5)] animate-pulse">
                {gapCountdown}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Coach & Mouse Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto w-full">
          {/* Mascot Coach Guide */}
          <div className="flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md max-w-md">
            <img className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0" src={BRAND_MASCOTS.explore} alt="" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-[#00D89A] uppercase tracking-wider">
                Gợi Ý Ra Chiêu Oẳn Tù Xì
              </span>
              <p className="text-[11px] sm:text-xs text-white/80 leading-snug">
                ✊ <b>Búa đập Kéo</b> • ✌️ <b>Kéo cắt Bao</b> • ✋ <b>Bao bọc Búa</b>
              </p>
            </div>
          </div>

          {/* Mouse / Keyboard manual triggers (nếu dùng chuột hoặc dự phòng) */}
          {(demoMode || cameraError) && (
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  engineRef.current?.setMouseChoice('rock');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#F59E0B]/25 hover:bg-[#F59E0B]/40 border border-[#F59E0B] text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✊</span>
                <span>Búa</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  engineRef.current?.setMouseChoice('scissors');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#EF4444]/25 hover:bg-[#EF4444]/40 border border-[#EF4444] text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✌️</span>
                <span>Kéo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  engineRef.current?.setMouseChoice('paper');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#10B981]/25 hover:bg-[#10B981]/40 border border-[#10B981] text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>✋</span>
                <span>Bao</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
