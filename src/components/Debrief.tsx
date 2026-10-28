import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES } from '../data/rps';
import { GameState } from '../utils/engine';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

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
    <div className="debrief-v3 force-motion flex-1 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden h-full">
      <div className="debrief-atmosphere" aria-hidden="true" />

      {/* Header */}
      <header className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0 animate-slide-top">
        <div className="flex items-center gap-2">
          <img className="h-6 sm:h-7 object-contain" src={MANABIE_MARK} alt="Manabie" />
          <div className="flex flex-col">
            <span className="text-white font-black text-xs sm:text-sm">TỔNG KẾT ĐẤU OẲN TÙ XÌ AR</span>
            <span className="text-[#00D89A] text-[10px] font-bold">MANABIE AI LAB</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToIntro}
          className="min-h-[32px] px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
        >
          ← Trang chủ
        </button>
      </header>

      {/* Main debrief card - Gọn gàng trên 1 màn hình */}
      <main className="my-auto py-2 max-w-2xl mx-auto w-full flex flex-col items-center gap-2 sm:gap-3">
        {/* Victory Banner */}
        <div
          className={`w-full p-3 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 relative overflow-hidden animate-banner-pop ${
            isWin
              ? 'bg-gradient-to-r from-[#00D89A]/20 via-[#10B981]/15 to-transparent border-[#00D89A] shadow-[0_0_30px_rgba(0,216,154,0.25)]'
              : isDraw
              ? 'bg-gradient-to-r from-[#F59E0B]/20 via-[#D97706]/15 to-transparent border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-gradient-to-r from-[#EF4444]/20 via-[#DC2626]/15 to-transparent border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-white/20 bg-white/5 overflow-hidden flex items-center justify-center shadow-lg">
                <CharacterAvatar character={character} className="w-full h-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 text-base sm:text-lg">
                {isWin ? '🏆' : isDraw ? '🤝' : '🤖'}
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span
                className={`px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider w-max ${
                  isWin
                    ? 'bg-[#00D89A] text-[#022318]'
                    : isDraw
                    ? 'bg-[#F59E0B] text-[#022318]'
                    : 'bg-[#EF4444] text-white'
                }`}
              >
                {isWin ? 'CHIẾN THẮNG CHUNG CUỘC' : isDraw ? 'HÒA CHUNG CUỘC' : 'MÁY THẮNG CHUNG CUỘC'}
              </span>
              <h2 className="text-base sm:text-xl font-black text-white mt-0.5">
                {isWin
                  ? 'Tuyệt Vời! Đã Đánh Bại AI Qua 2 Vòng Đấu!'
                  : isDraw
                  ? 'Trận Đấu Bất Phân Thắng Bại Cực Kỳ Gay Cấn!'
                  : 'Cố Gắng Lần Sau Nhé! AI Đã Đọc Được Vị Tay Của Bạn!'}
              </h2>
              <span className="text-[11px] text-white/70">
                Đội: <b>{profile.groupName}</b> · Lớp: <b>{profile.className}</b>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 pl-2 border-l border-white/10">
            <span className="text-[9px] font-bold text-white/50 uppercase">Tổng điểm</span>
            <span className="text-xl sm:text-3xl font-black font-mono text-[#00D89A] leading-tight">
              {state.score}
            </span>
          </div>
        </div>

        {/* 4 Core Metrics */}
        <div className="grid grid-cols-4 gap-2 w-full animate-slide-bottom">
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[9px] font-bold text-white/50 uppercase">Thắng</span>
            <b className="text-base sm:text-xl font-black font-mono text-[#10B981]">{state.totalWins}</b>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[9px] font-bold text-white/50 uppercase">Hòa</span>
            <b className="text-base sm:text-xl font-black font-mono text-[#F59E0B]">{state.totalDraws}</b>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[9px] font-bold text-white/50 uppercase">Thua</span>
            <b className="text-base sm:text-xl font-black font-mono text-rose-400">{state.totalLosses}</b>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <span className="text-[9px] font-bold text-white/50 uppercase">Tỉ Lệ Thắng</span>
            <b className="text-base sm:text-xl font-black font-mono text-[#38BDF8]">{winRate}%</b>
          </div>
        </div>

        {/* 2 Vòng Chi Tiết (Vòng 1 & Vòng 2) */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Vòng 1 */}
          <div className="p-2.5 rounded-xl bg-[#081028]/90 border border-white/10 flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider text-center">
              VÒNG 1 (5 LƯỢT ĐẤU)
            </span>
            <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
              <div className="p-1 rounded bg-[#10B981]/15 text-[#10B981]">
                <b>{state.round1Wins}</b> Thắng
              </div>
              <div className="p-1 rounded bg-[#F59E0B]/15 text-[#F59E0B]">
                <b>{state.round1Draws}</b> Hòa
              </div>
              <div className="p-1 rounded bg-rose-500/15 text-rose-400">
                <b>{state.round1Losses}</b> Thua
              </div>
            </div>
          </div>

          {/* Vòng 2 */}
          <div className="p-2.5 rounded-xl bg-[#081028]/90 border border-white/10 flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-[#00D89A] uppercase tracking-wider text-center">
              VÒNG 2 (5 LƯỢT ĐẤU)
            </span>
            <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
              <div className="p-1 rounded bg-[#10B981]/15 text-[#10B981]">
                <b>{state.round2Wins}</b> Thắng
              </div>
              <div className="p-1 rounded bg-[#F59E0B]/15 text-[#F59E0B]">
                <b>{state.round2Draws}</b> Hòa
              </div>
              <div className="p-1 rounded bg-rose-500/15 text-rose-400">
                <b>{state.round2Losses}</b> Thua
              </div>
            </div>
          </div>
        </div>

        {/* Timeline 10 Lượt Đấu Rút Gọn */}
        <div className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">
            Chi Tiết 10 Lượt Ra Chiêu:
          </span>
          <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
            {state.history.map((h, i) => (
              <div
                key={i}
                className={`flex flex-col items-center p-1 rounded-lg border text-[10px] min-w-[50px] shrink-0 ${
                  h.result === 'win'
                    ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                    : h.result === 'draw'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'border-rose-500 bg-rose-500/10 text-rose-400'
                }`}
              >
                <span className="font-bold">L{i + 1}</span>
                <span className="text-xs">{RPS_CHOICES[h.playerChoice].emoji} v {RPS_CHOICES[h.aiChoice].emoji}</span>
                <span className="font-mono text-[9px]">
                  {h.result === 'win' ? '+100' : h.result === 'draw' ? '+30' : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full pt-0.5">
          <button
            type="button"
            onClick={onReplay}
            className="min-h-[42px] px-6 py-2 rounded-2xl bg-gradient-to-r from-[#00D89A] to-[#10B981] text-[#022318] hover:shadow-[0_0_24px_rgba(0,216,154,0.6)] font-black text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>↻</span>
            <span>Tái Đấu Lượt Mới</span>
          </button>

          <button
            type="button"
            onClick={onOpenSetup}
            className="min-h-[40px] px-4 py-2 rounded-2xl bg-[#4C6DF0]/30 hover:bg-[#4C6DF0]/45 border border-[#4C6DF0]/60 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>✏️</span>
            <span>Đổi Đội & Nhân Vật</span>
          </button>
        </div>
      </main>

      <footer className="py-1 border-t border-white/10 text-center text-[10px] text-white/40 shrink-0">
        Oẳn Tù Xì AR · Manabie AI Lab · Skeleton Hand Tracking
      </footer>
    </div>
  );
}
