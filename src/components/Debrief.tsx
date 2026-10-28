import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { GameState } from '../utils/engine';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';
import { TenRoundProgressBar } from './TenRoundProgressBar';

interface DebriefProps {
  state: GameState;
  profile: PlayerProfile;
  onReplay: () => void;
  onOpenSetup: () => void;
  onBackToIntro: () => void;
}

export function Debrief({
  state,
  profile,
  onReplay,
  onOpenSetup,
  onBackToIntro,
}: DebriefProps) {
  const character = getCharacterById(profile.characterId);
  const totalTurns = state.history.length;
  const winRate = totalTurns > 0 ? Math.round((state.totalWins / totalTurns) * 100) : 0;
  const isWin = state.totalWins > state.totalLosses;
  const isDraw = state.totalWins === state.totalLosses;

  return (
    <div className="debrief-v3 force-motion flex-1 flex flex-col justify-between p-2 sm:p-3 overflow-hidden h-full select-none">
      <div className="debrief-atmosphere" aria-hidden="true" />

      {/* Header */}
      <header className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0 animate-slide-top">
        <div className="flex items-center gap-2">
          <img className="h-5 sm:h-6 object-contain" src={MANABIE_MARK} alt="Manabie" />
          <div className="flex flex-col">
            <span className="text-white font-black text-xs sm:text-sm leading-tight">TỔNG KẾT ĐẤU OẲN TÙ XÌ AR</span>
            <span className="text-[#00D89A] text-[9px] font-bold">MANABIE AI LAB · KẾT QUẢ 10 LƯỢT</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToIntro}
          className="min-h-[28px] px-2.5 py-0.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
        >
          ← Trang chủ
        </button>
      </header>

      {/* Main debrief content: Gọn gàng tuyệt đối, KHÔNG SCROLL */}
      <main className="my-auto py-1 max-w-2xl mx-auto w-full flex flex-col items-center gap-1.5 sm:gap-2 shrink overflow-hidden">
        {/* Victory Banner (Sleek & Compact) */}
        <div
          className={`w-full p-2 sm:p-2.5 rounded-2xl border flex items-center justify-between gap-3 relative overflow-hidden animate-banner-pop shrink-0 ${
            isWin
              ? 'bg-gradient-to-r from-[#00D89A]/20 via-[#10B981]/15 to-transparent border-[#00D89A] shadow-[0_0_24px_rgba(0,216,154,0.2)]'
              : isDraw
              ? 'bg-gradient-to-r from-[#F59E0B]/20 via-[#D97706]/15 to-transparent border-[#F59E0B] shadow-[0_0_18px_rgba(245,158,11,0.2)]'
              : 'bg-gradient-to-r from-[#EF4444]/20 via-[#DC2626]/15 to-transparent border-[#EF4444] shadow-[0_0_18px_rgba(239,68,68,0.2)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-white/20 bg-white/5 overflow-hidden flex items-center justify-center shadow-md">
                <CharacterAvatar character={character} className="w-full h-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 text-sm sm:text-base">
                {isWin ? '🏆' : isDraw ? '🤝' : '🤖'}
              </div>
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span
                className={`px-2 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider w-max ${
                  isWin
                    ? 'bg-[#00D89A] text-[#022318]'
                    : isDraw
                    ? 'bg-[#F59E0B] text-[#022318]'
                    : 'bg-[#EF4444] text-white'
                }`}
              >
                {isWin ? 'CHIẾN THẮNG CHUNG CUỘC' : isDraw ? 'HÒA CHUNG CUỘC' : 'MÁY THẮNG CHUNG CUỘC'}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white mt-0.5 truncate">
                {isWin
                  ? 'Xuất Sắc! Đã Chiến Thắng AI Qua 2 Vòng Đấu!'
                  : isDraw
                  ? 'Trận Đấu Cân Não Bất Phân Thắng Bại!'
                  : 'Cố Gắng Lần Sau! AI Đã Đọc Được Vị Ra Chiêu!'}
              </h2>
              <span className="text-[10px] text-white/70 truncate">
                Đội: <b>{profile.groupName}</b> · Lớp: <b>{profile.className}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 pl-2.5 border-l border-white/10">
            <span className="text-[8px] font-bold text-white/50 uppercase">Tổng điểm</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#00D89A] leading-tight">
              {state.score}
            </span>
          </div>
        </div>

        {/* 4 Core Metrics */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full shrink-0 animate-slide-bottom">
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase">Thắng</span>
            <b className="text-sm sm:text-base font-black font-mono text-[#10B981]">{state.totalWins}</b>
          </div>
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase">Hòa</span>
            <b className="text-sm sm:text-base font-black font-mono text-[#F59E0B]">{state.totalDraws}</b>
          </div>
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase">Thua</span>
            <b className="text-sm sm:text-base font-black font-mono text-rose-400">{state.totalLosses}</b>
          </div>
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase">Tỉ Lệ Thắng</span>
            <b className="text-sm sm:text-base font-black font-mono text-[#38BDF8]">{winRate}%</b>
          </div>
        </div>

        {/* Thanh 10 Vòng Đấu Tổng Kết: Xanh = Thắng, Đỏ = Thua, Vàng = Hòa */}
        <div className="w-full flex justify-center shrink-0 animate-slide-bottom">
          <TenRoundProgressBar
            history={state.history}
            currentRound={2}
            currentTurn={5}
            phase="GAMEOVER"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-2.5 w-full pt-1 shrink-0">
          <button
            type="button"
            onClick={onReplay}
            className="min-h-[38px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D89A] to-[#10B981] text-[#022318] hover:shadow-[0_0_20px_rgba(0,216,154,0.6)] font-black text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>↻</span>
            <span>Tái Đấu Lượt Mới</span>
          </button>

          <button
            type="button"
            onClick={onOpenSetup}
            className="min-h-[36px] px-3.5 py-2 rounded-xl bg-[#4C6DF0]/30 hover:bg-[#4C6DF0]/45 border border-[#4C6DF0]/60 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>✏️</span>
            <span>Đổi Đội & Nhân Vật</span>
          </button>
        </div>
      </main>

      <footer className="py-1 border-t border-white/10 text-center text-[9px] text-white/40 shrink-0">
        Oẳn Tù Xì AR · Manabie AI Lab · Skeleton Hand Tracking
      </footer>
    </div>
  );
}
