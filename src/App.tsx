import { useCallback, useEffect, useState } from 'react';
import { AIDifficulty } from './ai';
import { Game } from './components/Game';
import { Intro } from './components/Intro';
import { Tutorial } from './components/Tutorial';
import { Debrief } from './components/Debrief';
import { CharacterAvatar, PlayerSetupModal } from './components/PlayerSetupModal';
import { TenRoundProgressBar } from './components/TenRoundProgressBar';
import {
  getCharacterById,
  loadSavedPlayerProfile,
  PLAYER_CHARACTERS,
  PlayerProfile,
  savePlayerProfile,
} from './data/characters';
import { audio } from './utils/audio';
import { GameState } from './utils/engine';
import { isFullscreen, toggleFullscreen } from './utils/fullscreen';

type Screen = 'intro' | 'tutorial' | 'playing' | 'debrief';

const DEFAULT_PROFILE: PlayerProfile = {
  groupName: 'Đội Chiến Binh AI',
  className: '10A1',
  characterId: PLAYER_CHARACTERS[0].id,
  characterImage: PLAYER_CHARACTERS[0].image,
  characterName: PLAYER_CHARACTERS[0].name,
};

const EMPTY_GAME_STATE: GameState = {
  phase: 'CALIBRATING',
  round: 1,
  turn: 1,
  maxTurnsPerRound: 5,
  score: 0,
  streak: 0,
  bestStreak: 0,
  round1Wins: 0,
  round1Losses: 0,
  round1Draws: 0,
  round2Wins: 0,
  round2Losses: 0,
  round2Draws: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDraws: 0,
  countdownSeconds: 3.0,
  chantWord: 'OẲN',
  gapCountdown: 5,
  liveGesture: null,
  isHandMissing: false,
  shufflingAIChoice: 'rock',
  playerChoice: null,
  aiChoice: null,
  lastResult: null,
  resultMessage: '',
  resultDetail: '',
  isGameOver: false,
  isWin: false,
  handsVisible: 0,
  screenShake: 0,
  history: [],
  difficulty: 'normal',
  aiStatus: 'ready',
  aiStatusLabel: 'Sẵn sàng thi đấu',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [demoMode, setDemoMode] = useState(false);
  const [muted, setMuted] = useState(false);
  // Yêu cầu 1: Chọn nhân vật và điền thông tin nhóm, lớp hiện lên đầu tiên trước khi vào game
  const [profileModalOpen, setProfileModalOpen] = useState(true);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    return loadSavedPlayerProfile() || DEFAULT_PROFILE;
  });
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [state, setState] = useState<GameState>(EMPTY_GAME_STATE);
  const [finalState, setFinalState] = useState<GameState>(EMPTY_GAME_STATE);
  const [runKey, setRunKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setFullscreenActive(isFullscreen());
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  useEffect(() => {
    const intensity = state.phase === 'SHOWDOWN' ? 0.8 : state.streak >= 2 ? 0.5 : 0.2;
    audio.setIntensity(intensity);
  }, [state.phase, state.streak]);

  // Hiệu ứng chuyển trang mượt mà phong cách Cyberpunk Game
  const triggerTransition = useCallback((callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
    }, 120);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 450);
  }, []);

  const onGameOver = useCallback((s: GameState) => {
    triggerTransition(() => {
      audio.stopMusic();
      setFinalState(s);
      setScreen('debrief');
    });
  }, [triggerTransition]);

  const handleGoToTutorial = () => {
    triggerTransition(() => {
      setScreen('tutorial');
    });
  };

  const handleStartGame = () => {
    triggerTransition(() => {
      audio.init();
      audio.startMusic();
      setDemoMode(false);
      setState({ ...EMPTY_GAME_STATE, difficulty });
      setRunKey((k) => k + 1);
      setScreen('playing');
    });
  };

  const handleBackToIntro = () => {
    triggerTransition(() => {
      audio.stopMusic();
      setScreen('intro');
    });
  };

  const handleSaveProfile = (newProfile: PlayerProfile) => {
    setPlayerProfile(newProfile);
    savePlayerProfile(newProfile);
    setProfileModalOpen(false);
  };

  return (
    <div
      className="app-pointer-stage relative flex h-dvh flex-col overflow-hidden bg-[#030714]"
      data-screen={screen}
    >
      {/* HIỆU ỨNG LASER SWEEP KHI CHUYỂN TRANG */}
      {isTransitioning && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[#030714]/70 backdrop-blur-md animate-curtain-fade" />
          <div className="absolute w-[200%] h-1 bg-gradient-to-r from-transparent via-[#00D89A] to-transparent animate-laser-sweep shadow-[0_0_30px_#00D89A]" />
        </div>
      )}

      {/* MODAL CÀI ĐẶT THÔNG TIN NHÓM & NHÂN VẬT (Bắt buộc hoàn thành ban đầu) */}
      <PlayerSetupModal
        open={profileModalOpen}
        initialProfile={playerProfile}
        onConfirm={handleSaveProfile}
      />

      {/* MÀN HÌNH CHƠI AR */}
      {screen === 'playing' ? (
        <div key="screen-playing" className="flex-1 flex flex-col h-full overflow-hidden animate-screen-arena-enter">
          <GameHud
            state={state}
            profile={playerProfile}
            muted={muted}
            isFullscreen={fullscreenActive}
            onToggleMute={() => {
              setMuted((m) => {
                audio.setMuted(!m);
                return !m;
              });
            }}
            onToggleFullscreen={toggleFullscreen}
            onQuit={handleBackToIntro}
          />
          <main className="relative min-h-0 flex-1">
            <Game
              key={runKey}
              profile={playerProfile}
              demoMode={demoMode}
              difficulty={difficulty}
              onStateUpdate={setState}
              onGameOver={onGameOver}
            />
          </main>
        </div>
      ) : screen === 'intro' ? (
        /* MÀN HÌNH GIỚI THIỆU */
        <div key="screen-intro" className="flex-1 flex flex-col h-full overflow-hidden animate-screen-intro-enter">
          <Intro
            profile={playerProfile}
            difficulty={difficulty}
            isFullscreen={fullscreenActive}
            onSelectDifficulty={setDifficulty}
            onOpenSetup={() => setProfileModalOpen(true)}
            onToggleFullscreen={toggleFullscreen}
            onStart={handleGoToTutorial}
          />
        </div>
      ) : screen === 'tutorial' ? (
        /* MÀN HÌNH HƯỚNG DẪN LUẬT CHƠI & TƯ THẾ AR */
        <div key="screen-tutorial" className="flex-1 flex flex-col h-full overflow-hidden animate-screen-intro-enter">
          <Tutorial
            profile={playerProfile}
            isFullscreen={fullscreenActive}
            onBack={handleBackToIntro}
            onToggleFullscreen={toggleFullscreen}
            onStart={handleStartGame}
          />
        </div>
      ) : (
        /* MÀN HÌNH TỔNG KẾT CHIẾN THẮNG */
        <div key="screen-debrief" className="flex-1 flex flex-col h-full overflow-hidden animate-screen-debrief-enter">
          <Debrief
            state={finalState}
            profile={playerProfile}
            onReplay={handleStartGame}
            onOpenSetup={() => {
              setProfileModalOpen(true);
              handleBackToIntro();
            }}
            onBackToIntro={handleBackToIntro}
          />
        </div>
      )}
    </div>
  );
}

// Top Navigation HUD during gameplay
function GameHud({
  state,
  profile,
  muted,
  isFullscreen: isFs = false,
  onToggleMute,
  onToggleFullscreen,
  onQuit,
}: {
  state: GameState;
  profile: PlayerProfile;
  muted: boolean;
  isFullscreen?: boolean;
  onToggleMute: () => void;
  onToggleFullscreen?: () => void;
  onQuit: () => void;
}) {
  const char = getCharacterById(profile.characterId);

  return (
    <header className="shrink-0 flex items-center justify-between px-2.5 sm:px-4 py-1.5 bg-[#060c20]/95 border-b border-white/10 z-30 min-h-[50px] sm:min-h-[56px] backdrop-blur-md gap-2">
      {/* Bên Trái: Thông tin Đội chơi & Điểm số */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A] p-0.5 shrink-0">
            <CharacterAvatar character={char} />
          </div>
          <div className="hidden xs:flex flex-col min-w-0">
            <span className="text-white text-xs sm:text-sm font-black truncate max-w-[100px] sm:max-w-[140px]">
              {profile.groupName}
            </span>
            <span className="text-[#00D89A] text-[9.5px] sm:text-[10px] font-bold truncate">
              {profile.className}
            </span>
          </div>
        </div>

        {/* Điểm số & Chuỗi thắng */}
        <div className="flex items-center gap-2 px-2 py-0.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-[7.5px] sm:text-[8px] font-black uppercase text-white/50">Điểm</span>
            <span className="text-sm sm:text-base font-black font-mono text-[#00D89A] leading-tight">
              {state.score}
            </span>
          </div>
          <div className="flex flex-col items-center border-l border-white/10 pl-2">
            <span className="text-[7.5px] sm:text-[8px] font-black uppercase text-white/50">Chuỗi</span>
            <span className="text-sm sm:text-base font-black font-mono text-[#F59E0B] leading-tight">
              ×{state.streak}
            </span>
          </div>
        </div>
      </div>

      {/* Ở Giữa: THANH TIẾN ĐỘ 10 LƯỢT ĐẤU (Đưa lên Header, BỎ CHỮ AI THÍCH NGHI) */}
      <div className="flex-1 flex justify-center min-w-0">
        <TenRoundProgressBar
          history={state.history}
          currentRound={state.round}
          currentTurn={state.turn}
          phase={state.phase}
          inHeader={true}
        />
      </div>

      {/* Bên Phải: Controls (Toàn màn hình, Âm thanh, Thoát) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            title={isFs ? 'Thu nhỏ' : 'Toàn màn hình (Tablet)'}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs flex items-center justify-center transition-all cursor-pointer"
          >
            {isFs ? '🗗' : '⛶'}
          </button>
        )}

        <button
          type="button"
          onClick={onToggleMute}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs flex items-center justify-center transition-all cursor-pointer"
        >
          {muted ? '🔇' : '🔊'}
        </button>

        <button
          type="button"
          onClick={onQuit}
          className="h-8 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center"
        >
          Thoát
        </button>
      </div>
    </header>
  );
}
