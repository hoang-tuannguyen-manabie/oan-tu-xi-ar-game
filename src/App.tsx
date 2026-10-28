import { useCallback, useEffect, useState } from 'react';
import { AIDifficulty } from './ai';
import { Game } from './components/Game';
import { Intro } from './components/Intro';
import { Tutorial } from './components/Tutorial';
import { Debrief } from './components/Debrief';
import { CharacterAvatar, PlayerSetupModal } from './components/PlayerSetupModal';
import {
  getCharacterById,
  loadSavedPlayerProfile,
  PLAYER_CHARACTERS,
  PlayerProfile,
  savePlayerProfile,
} from './data/characters';
import { audio } from './utils/audio';
import { GameState } from './utils/engine';

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
            onToggleMute={() => {
              setMuted((m) => {
                audio.setMuted(!m);
                return !m;
              });
            }}
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
            onSelectDifficulty={setDifficulty}
            onOpenSetup={() => setProfileModalOpen(true)}
            onStart={handleGoToTutorial}
          />
        </div>
      ) : screen === 'tutorial' ? (
        /* MÀN HÌNH HƯỚNG DẪN LUẬT CHƠI & TƯ THẾ AR */
        <div key="screen-tutorial" className="flex-1 flex flex-col h-full overflow-hidden animate-screen-intro-enter">
          <Tutorial
            profile={playerProfile}
            onBack={handleBackToIntro}
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
  onToggleMute,
  onQuit,
}: {
  state: GameState;
  profile: PlayerProfile;
  muted: boolean;
  onToggleMute: () => void;
  onQuit: () => void;
}) {
  const char = getCharacterById(profile.characterId);

  return (
    <header className="shrink-0 flex items-center justify-between px-3 sm:px-5 py-2 bg-[#060c20]/90 border-b border-white/10 z-30 min-h-[50px] sm:min-h-[56px] backdrop-blur-md">
      {/* Player info */}
      <div className="flex items-center gap-2 pr-2 border-r border-white/10 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A] p-0.5">
          <CharacterAvatar character={char} />
        </div>
        <div className="hidden xs:flex flex-col">
          <span className="text-white text-xs font-black truncate max-w-[120px]">{profile.groupName}</span>
          <span className="text-[#00D89A] text-[10px] font-bold">{profile.className}</span>
        </div>
      </div>

      {/* Match Rounds Tracker */}
      <div className="flex items-center gap-2 sm:gap-4 px-2 border-r border-white/10 shrink-0">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase text-white/50">Vòng đấu</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${
              state.round === 1
                ? 'bg-[#38BDF8]/20 border border-[#38BDF8]/50 text-[#38BDF8]'
                : 'bg-[#00D89A]/20 border border-[#00D89A]/50 text-[#00D89A] animate-pulse'
            }`}
          >
            Vòng {state.round}/2 (Lượt {state.turn}/5)
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase text-white/50">Điểm Số</span>
          <span className="text-lg sm:text-xl font-black font-mono text-[#00D89A] leading-none">
            {state.score}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black uppercase text-white/50">Chuỗi Thắng</span>
          <span className="text-sm sm:text-base font-black font-mono text-[#F59E0B] leading-none">
            ×{state.streak}
          </span>
        </div>
      </div>

      {/* AI Mode and Status Banner */}
      <div className="hidden md:flex items-center gap-2 px-2 border-r border-white/10 shrink-0">
        <span className="text-[9px] font-black uppercase text-white/50">AI Thích Nghi</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
            state.difficulty === 'hard'
              ? 'bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444]'
              : state.difficulty === 'easy'
              ? 'bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981]'
              : 'bg-[#38BDF8]/20 border border-[#38BDF8]/50 text-[#38BDF8]'
          }`}
        >
          {state.difficulty === 'hard' ? 'Khó' : state.difficulty === 'easy' ? 'Dễ' : 'Thường'}
        </span>
        <span className="text-[10px] text-white/70 font-semibold truncate max-w-[170px]">
          {state.aiStatusLabel || 'Đang quan sát'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
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
          className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          Thoát
        </button>
      </div>
    </header>
  );
}
