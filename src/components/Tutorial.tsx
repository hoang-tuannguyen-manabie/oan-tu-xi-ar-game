import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES, RPSChoice } from '../data/rps';
import { HandSkeletonSvg } from './HandSkeletonSvg';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

interface TutorialProps {
  profile: PlayerProfile;
  isFullscreen?: boolean;
  onBack: () => void;
  onToggleFullscreen?: () => void;
  onStart: () => void;
}

interface GestureGuideItem {
  choice: (typeof RPS_CHOICES)[RPSChoice];
  colorHex: string;
  colorBorder: string;
  colorBg: string;
  colorText: string;
  beatsDesc: string;
  beatenByDesc: string;
  poseTitle: string;
  poseHow: string;
  badgeWin: string;
  badgeLose: string;
}

export function Tutorial({ profile, isFullscreen, onBack, onToggleFullscreen, onStart }: TutorialProps) {
  const character = getCharacterById(profile.characterId);

  const gesturesGuide: GestureGuideItem[] = [
    {
      choice: RPS_CHOICES.rock,
      colorHex: '#F59E0B',
      colorBorder: 'border-[#F59E0B]',
      colorBg: 'bg-[#F59E0B]/20',
      colorText: 'text-[#F59E0B]',
      beatsDesc: 'Thắng KÉO (Đập Kéo)',
      beatenByDesc: 'Thua BAO (Bị Bao bọc)',
      poseTitle: 'Nắm Chặt Cả 5 Ngón',
      poseHow: 'Gập chặt tất cả các ngón tay thành nắm đấm tròn, khép ngón cái ôm sát bên ngoài các khớp ngón.',
      badgeWin: 'bg-[#10B981]/25 text-[#10B981] border-[#10B981]/50',
      badgeLose: 'bg-[#EF4444]/25 text-[#EF4444] border-[#EF4444]/50',
    },
    {
      choice: RPS_CHOICES.scissors,
      colorHex: '#EF4444',
      colorBorder: 'border-[#EF4444]',
      colorBg: 'bg-[#EF4444]/20',
      colorText: 'text-[#EF4444]',
      beatsDesc: 'Thắng BAO (Cắt Bao)',
      beatenByDesc: 'Thua BÚA (Bị Búa đập)',
      poseTitle: 'Duỗi Chữ V (2 Ngón)',
      poseHow: 'Duỗi thẳng và xòe rõ ngón trỏ cùng ngón giữa thành chữ V. Gập chặt 3 ngón còn lại vào lòng bàn tay.',
      badgeWin: 'bg-[#10B981]/25 text-[#10B981] border-[#10B981]/50',
      badgeLose: 'bg-[#F59E0B]/25 text-[#F59E0B] border-[#F59E0B]/50',
    },
    {
      choice: RPS_CHOICES.paper,
      colorHex: '#10B981',
      colorBorder: 'border-[#10B981]',
      colorBg: 'bg-[#10B981]/20',
      colorText: 'text-[#10B981]',
      beatsDesc: 'Thắng BÚA (Bọc Búa)',
      beatenByDesc: 'Thua KÉO (Bị Kéo cắt)',
      poseTitle: 'Xòe Thẳng 5 Ngón',
      poseHow: 'Mở rộng và duỗi thẳng tất cả 5 ngón tay, giữ lòng bàn tay hoặc mu bàn tay phẳng hướng về camera.',
      badgeWin: 'bg-[#F59E0B]/25 text-[#F59E0B] border-[#F59E0B]/50',
      badgeLose: 'bg-[#EF4444]/25 text-[#EF4444] border-[#EF4444]/50',
    },
  ];

  return (
    <div className="workshop-stage force-motion flex-1 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden h-full select-none">
      {/* Background atmosphere */}
      <div className="workshop-atmosphere" aria-hidden="true">
        <span className="workshop-grid" />
        <span className="workshop-scanline" />
        <span className="workshop-glow workshop-glow-a" />
        <span className="workshop-glow workshop-glow-b" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 shrink-0 animate-slide-top">
        <div className="flex items-center gap-2">
          <img className="h-6 sm:h-7 object-contain" src={MANABIE_MARK} alt="Manabie" />
          <div className="flex flex-col">
            <span className="text-white font-black text-xs sm:text-base tracking-wider leading-tight">
              HƯỚNG DẪN LUẬT CHƠI & SKELETON AR
            </span>
            <span className="text-[#00D89A] text-[10px] sm:text-xs font-bold">
              MANABIE AI LAB · KHỞI ĐỘNG AR OẲN TÙ XÌ
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình (Tablet)'}
              className="min-h-[28px] sm:min-h-[30px] px-2.5 py-0.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{isFullscreen ? '🗗' : '⛶'}</span>
              <span className="hidden sm:inline text-[11px]">{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="min-h-[28px] sm:min-h-[30px] px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>←</span>
            <span>Trang chủ</span>
          </button>
        </div>
      </header>

      {/* Main Content: Bố cục cân đối (max-w-5xl), chữ to rõ, 100% Zero-Scroll */}
      <main className="my-auto py-1 flex flex-col items-center justify-center gap-2 sm:gap-3 max-w-5xl mx-auto w-full shrink overflow-hidden">
        {/* Banner Tổng Quan Đội & Khắc Chế Nhanh */}
        <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#08122c]/90 border border-[#38BDF8]/40 shadow-md backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-[#00D89A]/60 flex items-center justify-center p-0.5 shrink-0">
              <CharacterAvatar character={character} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-black text-white truncate">
                Đội: <span className="text-[#00D89A]">{profile.groupName}</span> ({profile.className})
              </span>
              <span className="text-[11px] sm:text-xs text-white/85 truncate">
                Quy ước: <b>✊ đập ✌️</b> · <b>✌️ cắt ✋</b> · <b>✋ bọc ✊</b> (Cùng chiêu là <b>HÒA 🤝</b>)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00D89A]/20 border border-[#00D89A]/40 text-[#00D89A] text-[10px] sm:text-xs font-black shrink-0">
            <span>● 2 VÒNG · 10 LƯỢT ĐẤU</span>
          </div>
        </div>

        {/* 3 Thẻ Chiêu Thức: Cân đối bố cục, chữ to rõ nét, có cả Ảnh Minh Họa + Skeleton 21 Khớp MediaPipe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3.5 w-full shrink overflow-hidden">
          {gesturesGuide.map((item) => (
            <div
              key={item.choice.id}
              className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-black/60 border-2 ${item.colorBorder} flex flex-col justify-between gap-2 shadow-lg backdrop-blur-md animate-card-pop`}
            >
              {/* Header Thẻ: Dual Visuals (Ảnh mẫu + Skeleton AR) */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                {/* Visual Boxes */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Comic Hand Sprite */}
                  <div className="flex flex-col items-center">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-black/50 border border-white/20 p-1 flex items-center justify-center shadow-inner">
                      <img
                        src={item.choice.image}
                        alt={item.choice.vietnameseName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white/60 mt-0.5">Hình mẫu</span>
                  </div>

                  {/* SKELETON AR MẪU (21 Khớp MediaPipe Landmarks Glowing) */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl ${item.colorBg} border ${item.colorBorder} p-1 flex items-center justify-center relative overflow-hidden shadow-[0_0_14px_rgba(0,0,0,0.6)]`}
                    >
                      <HandSkeletonSvg gesture={item.choice.id} color={item.colorHex} />
                      <span className="absolute top-0.5 right-1 text-[7.5px] font-mono text-white/90 font-black">
                        21-AR
                      </span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-black ${item.colorText} mt-0.5`}>
                      Skeleton AR
                    </span>
                  </div>
                </div>

                {/* Tên & Tư thế */}
                <div className="flex flex-col items-end min-w-0">
                  <span className={`text-sm sm:text-base md:text-lg font-black uppercase ${item.colorText} leading-tight`}>
                    {item.choice.vietnameseName} {item.choice.emoji}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/90 truncate text-right">
                    {item.poseTitle}
                  </span>

                  {/* Badges Thắng / Thua */}
                  <div className="flex flex-col items-end gap-1 mt-1 text-[9px] sm:text-[10px] md:text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-black border ${item.badgeWin} whitespace-nowrap`}>
                      ✓ {item.beatsDesc}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-black border ${item.badgeLose} whitespace-nowrap`}>
                      ✕ {item.beatenByDesc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chi tiết Tư thế tay: Tập trung, chữ to, rõ ràng */}
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/95 text-xs sm:text-sm leading-relaxed">
                  👉 <b>Tư thế:</b> {item.poseHow}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lưu ý khi đấu AR: Dùng 1 bàn tay, nhịp đếm 3s */}
        <div className="w-full p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col xs:flex-row items-center justify-between gap-1.5 sm:gap-3 text-xs sm:text-sm text-white/85 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">🖐️</span>
            <span>
              Dùng <b>1 bàn tay duy nhất</b> cách camera <b>0.5m – 1.2m</b> ở nơi đủ sáng.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">⏱️</span>
            <span>
              Đếm nhịp <b>OẲN - TÙ - XÌ (3s)</b>: Giữ cố định thế tay khi hết giờ!
            </span>
          </div>
        </div>

        {/* Nút hành động chính - Vào đấu AR ngay */}
        <div className="w-full pt-0.5 shrink-0">
          <button
            type="button"
            onClick={onStart}
            className="w-full min-h-[44px] sm:min-h-[48px] px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#00D89A] via-[#10B981] to-[#059669] text-[#022318] hover:shadow-[0_0_30px_rgba(0,216,154,0.7)] font-black text-xs sm:text-sm md:text-base uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-lg sm:text-xl">🎮</span>
            <span>ĐÃ HIỂU LUẬT & TƯ THẾ · VÀO ĐẤU AR NGAY (10 LƯỢT)</span>
            <span>➔</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-1 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-white/50 shrink-0 animate-slide-bottom">
        <div className="flex items-center gap-1.5 truncate">
          <span><b>Quy ước:</b> Búa đập Kéo</span>
          <i>›</i>
          <span>Kéo cắt Bao</span>
          <i>›</i>
          <span>Bao bọc Búa</span>
        </div>
        <div className="text-[#00D89A] font-bold shrink-0">Oẳn Tù Xì AR · Manabie Lab</div>
      </footer>
    </div>
  );
}
