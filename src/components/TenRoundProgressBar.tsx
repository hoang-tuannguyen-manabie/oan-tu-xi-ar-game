import { RPS_CHOICES } from '../data/rps';
import { TurnHistoryItem, GamePhase } from '../utils/engine';

interface TenRoundProgressBarProps {
  history: TurnHistoryItem[];
  currentRound: 1 | 2;
  currentTurn: number; // 1..5
  phase: GamePhase;
  compact?: boolean;
}

export function TenRoundProgressBar({
  history,
  currentRound,
  currentTurn,
  phase,
  compact = false,
}: TenRoundProgressBarProps) {
  // Tính chỉ số tổng thể của lượt hiện tại (0..9)
  let currentOverallIndex: number;
  if (phase === 'GAMEOVER') {
    currentOverallIndex = 10;
  } else if (phase === 'ROUND_GAP') {
    currentOverallIndex = 5; // Chuẩn bị lượt 6
  } else if (currentRound === 1) {
    currentOverallIndex = Math.max(0, Math.min(4, currentTurn - 1));
  } else {
    currentOverallIndex = Math.max(5, Math.min(9, 5 + (currentTurn - 1)));
  }

  // Thống kê nhanh
  const wins = history.filter((h) => h.result === 'win').length;
  const losses = history.filter((h) => h.result === 'lose').length;
  const draws = history.filter((h) => h.result === 'draw').length;

  const renderSlot = (slotIndex: number) => {
    const record = history[slotIndex];
    const isCurrent = slotIndex === currentOverallIndex && phase !== 'GAMEOVER';
    const turnNumber = slotIndex + 1;

    let bgStyle = 'bg-white/5 border-white/15 text-white/35';
    let icon = `${turnNumber}`;

    if (record) {
      if (record.result === 'win') {
        // Thắng máy: Tô xanh lá
        bgStyle = 'bg-[#00D89A] border-[#00D89A] text-[#022318] shadow-[0_0_14px_rgba(0,216,154,0.65)] font-black';
        icon = '✓';
      } else if (record.result === 'lose') {
        // Thua máy: Tô đỏ
        bgStyle = 'bg-[#EF4444] border-[#EF4444] text-white shadow-[0_0_14px_rgba(239,68,68,0.65)] font-black';
        icon = '✕';
      } else {
        // Hòa máy: Tô vàng
        bgStyle = 'bg-[#F59E0B] border-[#F59E0B] text-[#022318] shadow-[0_0_14px_rgba(245,158,11,0.65)] font-black';
        icon = '=';
      }
    } else if (isCurrent) {
      // Lượt hiện tại: Hiện màu xanh dương nguyên khối đồng nhất, không lỗi UI
      bgStyle =
        'bg-[#38BDF8] border-[#38BDF8] text-[#02182b] shadow-[0_0_14px_rgba(56,189,248,0.65)] font-black';
    }

    const tooltip = record
      ? `Lượt ${turnNumber}: Bạn ra ${RPS_CHOICES[record.playerChoice]?.vietnameseName || ''} (${RPS_CHOICES[record.playerChoice]?.emoji || ''}) v AI ${RPS_CHOICES[record.aiChoice]?.vietnameseName || ''} (${RPS_CHOICES[record.aiChoice]?.emoji || ''}) → ${record.result === 'win' ? 'Thắng máy (+100)' : record.result === 'lose' ? 'Thua máy (0)' : 'Hòa máy (+30)'}`
      : isCurrent
      ? `Lượt ${turnNumber} (Đang đấu)`
      : `Lượt ${turnNumber} (Chưa đấu)`;

    return (
      <div
        key={`turn-slot-${slotIndex}`}
        title={tooltip}
        className={`flex items-center justify-center rounded-xl border transition-all duration-200 shrink-0 select-none ${
          compact ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'
        } ${bgStyle}`}
      >
        <span>{icon}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#060e24]/90 border border-white/15 backdrop-blur-md shadow-lg max-w-full shrink-0">
      {/* Top Header & Tỷ số nhanh */}
      <div className="flex items-center justify-between gap-3 w-full text-[10px] sm:text-xs">
        <span className="font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5 shrink-0">
          <span>🎯</span>
          <span>TIẾN ĐỘ 10 VÒNG ĐẤU</span>
        </span>

        {/* Chú giải kết quả: Xanh = Thắng, Đỏ = Thua, Vàng = Hòa */}
        <div className="flex items-center gap-2 font-bold shrink-0">
          <span className="flex items-center gap-1 text-[#00D89A]">
            <span className="w-2 h-2 rounded-full bg-[#00D89A] shadow-[0_0_6px_#00D89A]" />
            <span>Thắng {wins}</span>
          </span>
          <span className="flex items-center gap-1 text-[#EF4444]">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]" />
            <span>Thua {losses}</span>
          </span>
          <span className="flex items-center gap-1 text-[#F59E0B]">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
            <span>Hòa {draws}</span>
          </span>
        </div>
      </div>

      {/* 10 Vòng đấu: 5 Vòng 1 + Phân cách + 5 Vòng 2 (Luôn nằm trên 1 hàng ngang, tuyệt đối không wrap) */}
      <div className="flex items-center gap-1 sm:gap-2 flex-nowrap shrink-0 overflow-x-auto max-w-full">
        {/* Vòng 1 Tag */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 flex-nowrap shrink-0">
          <span className="text-[9px] font-black uppercase text-[#38BDF8] px-1 shrink-0">
            V1
          </span>
          {[0, 1, 2, 3, 4].map(renderSlot)}
        </div>

        {/* Intermission divider */}
        <div className="flex flex-col items-center justify-center px-1 shrink-0">
          <span className="text-[10px] text-white/30 font-black">|</span>
        </div>

        {/* Vòng 2 Tag */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 flex-nowrap shrink-0">
          <span className="text-[9px] font-black uppercase text-[#00D89A] px-1 shrink-0">
            V2
          </span>
          {[5, 6, 7, 8, 9].map(renderSlot)}
        </div>
      </div>
    </div>
  );
}
