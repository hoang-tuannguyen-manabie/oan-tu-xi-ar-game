import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES } from '../data/rps';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

interface TutorialProps {
  profile: PlayerProfile;
  onBack: () => void;
  onStart: () => void;
}

export function Tutorial({ profile, onBack, onStart }: TutorialProps) {
  const character = getCharacterById(profile.characterId);

  const gesturesGuide = [
    {
      choice: RPS_CHOICES.rock,
      beatsDesc: 'Thắng KÉO (Búa đập Kéo)',
      beatenByDesc: 'Thua BAO (Bao bọc Búa)',
      poseTitle: 'Nắm Chặt Cả 5 Ngón',
      poseHow: 'Gập chặt tất cả các ngón tay thành nắm đấm tròn, khép ngón cái ôm sát bên ngoài các khớp ngón.',
      arTip: 'Hướng nắm đấm trực diện vào camera; tuyệt đối không để ngón cái hoặc ngón trỏ nhô ra ngoài.',
      colorBorder: 'border-[#F59E0B]',
      colorBg: 'bg-[#F59E0B]/15',
      colorText: 'text-[#F59E0B]',
      badgeWin: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40',
      badgeLose: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40',
    },
    {
      choice: RPS_CHOICES.scissors,
      beatsDesc: 'Thắng BAO (Kéo cắt Bao)',
      beatenByDesc: 'Thua BÚA (Búa đập Kéo)',
      poseTitle: 'Duỗi Chữ V (2 Ngón Trỏ + Giữa)',
      poseHow: 'Duỗi thẳng và xòe rộng ngón trỏ cùng ngón giữa thành chữ V. Gập chặt 3 ngón còn lại vào lòng bàn tay.',
      arTip: 'Hai ngón tay phải duỗi thẳng và tách nhau rõ ràng, tránh khép dính hai ngón vào nhau.',
      colorBorder: 'border-[#EF4444]',
      colorBg: 'bg-[#EF4444]/15',
      colorText: 'text-[#EF4444]',
      badgeWin: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40',
      badgeLose: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40',
    },
    {
      choice: RPS_CHOICES.paper,
      beatsDesc: 'Thắng BÚA (Bao bọc Búa)',
      beatenByDesc: 'Thua KÉO (Kéo cắt Bao)',
      poseTitle: 'Xòe Thẳng Toàn Bộ 5 Ngón',
      poseHow: 'Mở rộng và duỗi thẳng tất cả 5 ngón tay, giữ lòng bàn tay hoặc mu bàn tay hướng phẳng về phía trước.',
      arTip: 'Các ngón tay phải xòe tách đều nhau, không khum bàn tay để Skeleton AR bắt đủ 5 đầu khớp ngón.',
      colorBorder: 'border-[#10B981]',
      colorBg: 'bg-[#10B981]/15',
      colorText: 'text-[#10B981]',
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
              HƯỚNG DẪN LUẬT CHƠI & TƯ THẾ AR
            </span>
            <span className="text-[#00D89A] text-[9px] sm:text-[10px] font-bold">
              MANABIE AI LAB · SKELETON KHỚP TAY
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

      {/* Main Content: Mobile-First, Zero Scroll */}
      <main className="my-auto py-1 flex flex-col items-center justify-center gap-1.5 sm:gap-2.5 max-w-4xl mx-auto w-full shrink overflow-hidden">
        {/* Banner tóm tắt quy tắc */}
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
                Quy luật: <b>✊ đập ✌️</b> · <b>✌️ cắt ✋</b> · <b>✋ bọc ✊</b> (Cùng chiêu là <b>HÒA 🤝</b>)
              </span>
            </div>
          </div>

          <div className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] text-[9px] font-black shrink-0">
            <span>⚡ 10 LƯỢT ĐẤU</span>
          </div>
        </div>

        {/* 3 Thẻ Chiêu Thức: Mô tả thắng/thua & Tư thế tay chuẩn Skeleton AR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 sm:gap-2.5 w-full shrink overflow-hidden">
          {gesturesGuide.map((item) => (
            <div
              key={item.choice.id}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-black/45 border-2 ${item.colorBorder} flex flex-col justify-between gap-1 shadow-md backdrop-blur-md animate-card-pop`}
            >
              {/* Top: Ảnh, Tên chiêu thức, Tư thế & Badge Thắng/Thua */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${item.colorBg} p-1 flex items-center justify-center shrink-0 border border-white/10`}>
                    <img
                      src={item.choice.image}
                      alt={item.choice.vietnameseName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs sm:text-sm font-black uppercase ${item.colorText} leading-tight`}>
                      {item.choice.vietnameseName} {item.choice.emoji}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-bold text-white/70 truncate">
                      {item.poseTitle}
                    </span>
                  </div>
                </div>

                {/* Badges Thắng Thua */}
                <div className="flex flex-col items-end gap-0.5 shrink-0 text-[7.5px] sm:text-[8.5px]">
                  <span className={`px-1.5 py-0.2 rounded font-black border ${item.badgeWin} whitespace-nowrap`}>
                    ✓ {item.beatsDesc}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-black border ${item.badgeLose} whitespace-nowrap`}>
                    ✕ {item.beatenByDesc}
                  </span>
                </div>
              </div>

              {/* Bottom: Cách làm tay & Mẹo AR */}
              <div className="p-1 sm:p-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-0.5 text-[8px] sm:text-[9px] leading-tight">
                <p className="text-white/85">
                  👉 <b>Tư thế:</b> {item.poseHow}
                </p>
                <p className="text-[#F4BE4F]">
                  💡 <b>Mẹo AR:</b> {item.arTip}
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

        {/* Nút hành động chính - Bắt đầu vào trận đấu */}
        <div className="w-full pt-0.5 shrink-0">
          <button
            type="button"
            onClick={onStart}
            className="w-full min-h-[42px] sm:min-h-[46px] px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#00D89A] via-[#10B981] to-[#059669] text-[#022318] hover:shadow-[0_0_30px_rgba(0,216,154,0.7)] font-black text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="text-base sm:text-lg">🎮</span>
            <span>ĐÃ HIỂU LUẬT · VÀO ĐẤU AR NGAY (10 LƯỢT)</span>
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
