import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES, RPSChoice } from '../data/rps';
import { HandSkeletonSvg } from './HandSkeletonSvg';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

interface TutorialProps {
  profile: PlayerProfile;
  onBack: () => void;
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
  arTip: string;
  badgeWin: string;
  badgeLose: string;
}

export function Tutorial({ profile, onBack, onStart }: TutorialProps) {
  const character = getCharacterById(profile.characterId);

  const gesturesGuide: GestureGuideItem[] = [
    {
      choice: RPS_CHOICES.rock,
      colorHex: '#F59E0B',
      colorBorder: 'border-[#F59E0B]',
      colorBg: 'bg-[#F59E0B]/15',
      colorText: 'text-[#F59E0B]',
      beatsDesc: 'Thắng KÉO (Đập Kéo)',
      beatenByDesc: 'Thua BAO (Bị Bao bọc)',
      poseTitle: 'Nắm Chặt Cả 5 Ngón',
      poseHow: 'Gập chặt tất cả các ngón tay thành nắm đấm tròn, khép ngón cái ôm sát bên ngoài các khớp.',
      arTip: 'Hướng nắm đấm về phía camera; tuyệt đối không để ngón cái hoặc ngón trỏ nhô ra ngoài.',
      badgeWin: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40',
      badgeLose: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40',
    },
    {
      choice: RPS_CHOICES.scissors,
      colorHex: '#EF4444',
      colorBorder: 'border-[#EF4444]',
      colorBg: 'bg-[#EF4444]/15',
      colorText: 'text-[#EF4444]',
      beatsDesc: 'Thắng BAO (Cắt Bao)',
      beatenByDesc: 'Thua BÚA (Bị Búa đập)',
      poseTitle: 'Duỗi Chữ V (2 Ngón)',
      poseHow: 'Duỗi thẳng và xòe rõ ngón trỏ cùng ngón giữa thành chữ V. Gập chặt 3 ngón còn lại vào lòng bàn tay.',
      arTip: '2 ngón tay phải duỗi thẳng và tách nhau rõ ràng, tránh khép dính hai ngón vào nhau.',
      badgeWin: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40',
      badgeLose: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40',
    },
    {
      choice: RPS_CHOICES.paper,
      colorHex: '#10B981',
      colorBorder: 'border-[#10B981]',
      colorBg: 'bg-[#10B981]/15',
      colorText: 'text-[#10B981]',
      beatsDesc: 'Thắng BÚA (Bọc Búa)',
      beatenByDesc: 'Thua KÉO (Bị Kéo cắt)',
      poseTitle: 'Xòe Thẳng 5 Ngón',
      poseHow: 'Mở rộng và duỗi thẳng tất cả 5 ngón tay, giữ lòng bàn tay hoặc mu bàn tay phẳng hướng về camera.',
      arTip: 'Các ngón tay phải xòe tách đều nhau, không khum bàn tay để Skeleton bắt đủ 5 đầu ngón.',
      badgeWin: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40',
      badgeLose: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40',
    },
  ];

  return (
    <div className="workshop-stage force-motion flex-1 flex flex-col justify-between p-2 sm:p-4 overflow-hidden h-full select-none">
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
          <img className="h-5 sm:h-6 object-contain" src={MANABIE_MARK} alt="Manabie" />
          <div className="flex flex-col">
            <span className="text-white font-black text-xs sm:text-sm tracking-wider leading-tight">
              HƯỚNG DẪN LUẬT CHƠI & SKELETON AR
            </span>
            <span className="text-[#00D89A] text-[9px] sm:text-[10px] font-bold">
              MANABIE AI LAB · KHỞI ĐỘNG AR OẲN TÙ XÌ
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="min-h-[28px] px-2.5 py-0.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
        >
          <span>←</span>
          <span>Trang chủ</span>
        </button>
      </header>

      {/* Main Content: Bố cục cân đối, rộng vừa đủ (max-w-5xl), 100% Zero-Scroll */}
      <main className="my-auto py-1 flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 max-w-5xl mx-auto w-full shrink overflow-hidden">
        {/* Banner Tổng Quan Đội & Khắc Chế Nhanh */}
        <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#08122c]/85 border border-[#38BDF8]/40 shadow-md backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 border border-[#00D89A]/60 flex items-center justify-center p-0.5 shrink-0">
              <CharacterAvatar character={character} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs font-black text-white truncate">
                Đội: <span className="text-[#00D89A]">{profile.groupName}</span> ({profile.className})
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] text-white/70 truncate">
                Quy ước: <b>✊ đập ✌️</b> · <b>✌️ cắt ✋</b> · <b>✋ bọc ✊</b> (Cùng chiêu là <b>HÒA 🤝</b>)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D89A]/15 border border-[#00D89A]/30 text-[#00D89A] text-[8.5px] sm:text-[9.5px] font-black shrink-0">
            <span>● 2 VÒNG · 10 LƯỢT ĐẤU</span>
          </div>
        </div>

        {/* 3 Thẻ Chiêu Thức: Cân đối bố cục, gồm Ảnh Minh Họa + Ảnh Skeleton Mẫu (21 Khớp MediaPipe) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 w-full shrink overflow-hidden">
          {gesturesGuide.map((item) => (
            <div
              key={item.choice.id}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/55 border-2 ${item.colorBorder} flex flex-col justify-between gap-1.5 shadow-lg backdrop-blur-md animate-card-pop`}
            >
              {/* Header Thẻ: Dual Visuals (Hình ảnh chiêu thức + Skeleton AR mẫu 21 khớp) */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                {/* Visual Boxes */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Comic Hand Sprite */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/40 border border-white/15 p-1 flex items-center justify-center shadow-inner">
                      <img
                        src={item.choice.image}
                        alt={item.choice.vietnameseName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[7px] font-bold text-white/50 mt-0.5">Hình mẫu</span>
                  </div>

                  {/* SKELETON AR MẪU (21 Khớp MediaPipe Landmarks Glowing) */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.colorBg} border ${item.colorBorder} p-1 flex items-center justify-center relative overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.5)]`}
                    >
                      <HandSkeletonSvg gesture={item.choice.id} color={item.colorHex} />
                      <span className="absolute top-0.5 right-1 text-[6.5px] font-mono text-white/80 font-black">
                        21-AR
                      </span>
                    </div>
                    <span className={`text-[7px] font-bold ${item.colorText} mt-0.5`}>
                      Skeleton AR
                    </span>
                  </div>
                </div>

                {/* Tên & Tư thế */}
                <div className="flex flex-col items-end min-w-0">
                  <span className={`text-xs sm:text-sm font-black uppercase ${item.colorText} leading-tight`}>
                    {item.choice.vietnameseName} {item.choice.emoji}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-white/80 truncate text-right">
                    {item.poseTitle}
                  </span>

                  {/* Badges Thắng / Thua */}
                  <div className="flex flex-col items-end gap-0.5 mt-1 text-[7.5px] sm:text-[8px]">
                    <span className={`px-1.5 py-0.2 rounded font-black border ${item.badgeWin} whitespace-nowrap`}>
                      ✓ {item.beatsDesc}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded font-black border ${item.badgeLose} whitespace-nowrap`}>
                      ✕ {item.beatenByDesc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chi tiết Tư thế tay & Mẹo camera AR */}
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-0.5 text-[8px] sm:text-[9px] leading-tight">
                <p className="text-white/90">
                  👉 <b>Tư thế:</b> {item.poseHow}
                </p>
                <p className="text-[#F4BE4F]">
                  💡 <b>Mẹo Skeleton AR:</b> {item.arTip}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mẹo nhận diện AR chuẩn 100% */}
        <div className="w-full p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 flex flex-col xs:flex-row items-center justify-between gap-1 sm:gap-2.5 text-[8.5px] sm:text-[9.5px] text-white/70 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base">🖐️</span>
            <span>
              Dùng <b>1 bàn tay duy nhất</b> cách camera <b>0.5m – 1.2m</b> ở nơi đủ sáng.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base">⏱️</span>
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
            className="w-full min-h-[42px] sm:min-h-[46px] px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#00D89A] via-[#10B981] to-[#059669] text-[#022318] hover:shadow-[0_0_30px_rgba(0,216,154,0.7)] font-black text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-base sm:text-lg">🎮</span>
            <span>ĐÃ HIỂU LUẬT & TƯ THẾ · VÀO ĐẤU AR NGAY (10 LƯỢT)</span>
            <span>➔</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-1 border-t border-white/10 flex items-center justify-between gap-2 text-[9px] text-white/40 shrink-0 animate-slide-bottom">
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
