import { AIDifficulty } from '../ai';
import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES } from '../data/rps';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

interface IntroProps {
  profile: PlayerProfile;
  difficulty: AIDifficulty;
  isFullscreen?: boolean;
  onSelectDifficulty: (d: AIDifficulty) => void;
  onOpenSetup: () => void;
  onToggleFullscreen?: () => void;
  onStart: () => void;
}

export function Intro({ profile, difficulty, isFullscreen, onSelectDifficulty, onOpenSetup, onToggleFullscreen, onStart }: IntroProps) {
  const character = getCharacterById(profile.characterId);

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
            <span className="text-white font-black text-xs sm:text-sm tracking-wider leading-tight">MANABIE AI LAB</span>
            <span className="text-[#00D89A] text-[9px] sm:text-[10px] font-bold">HOẠT ĐỘNG KHỞI ĐỘNG AR</span>
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
          <div className="px-2 py-0.5 rounded-full bg-[#00D89A]/15 border border-[#00D89A]/40 text-[#00D89A] text-[9px] sm:text-[10px] font-black tracking-wider uppercase">
            ● SẴN SÀNG
          </div>
        </div>
      </header>

      {/* Main Content - Cực kỳ gọn gàng, chuẩn Mobile-First, 100% Không Scroll */}
      <main className="my-auto py-1 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 lg:gap-8 max-w-5xl mx-auto w-full shrink overflow-hidden">
        {/* Left Column: Title, 3 Moves Preview, Rounds, Profile, Difficulty, Action */}
        <div className="flex flex-col gap-1.5 sm:gap-2 max-w-md w-full animate-slide-left shrink-0">
          {/* Tag & Heading */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-1.5 py-0.2 rounded bg-[#4C6DF0]/25 border border-[#4C6DF0]/40 text-[#8ba2ff] text-[9px] font-black uppercase tracking-wider">
                Khởi động AR
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-[#F4BE4F] text-[9px] sm:text-[10px] font-bold">Skeleton Khớp Bàn Tay</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              OẲN TÙ XÌ ·{' '}
              <span className="bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#10B981] bg-clip-text text-transparent">
                ĐẤU TRÍ VỚI AI
              </span>
            </h1>

            </div>

          {/* 3 Chiêu Thức Mini Strip (Hiển thị ngay trên mobile, trực quan, không chiếm chỗ) */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-black/40 border border-white/10 md:hidden">
            <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30">
              <img src={RPS_CHOICES.rock.image} alt="Búa" className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[#F59E0B] text-[9px] sm:text-[10px] font-black leading-tight">BÚA ✊</span>
                <span className="text-[8px] text-white/50 leading-none truncate">Đập Kéo</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30">
              <img src={RPS_CHOICES.scissors.image} alt="Kéo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[#EF4444] text-[9px] sm:text-[10px] font-black leading-tight">KÉO ✌️</span>
                <span className="text-[8px] text-white/50 leading-none truncate">Cắt Bao</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30">
              <img src={RPS_CHOICES.paper.image} alt="Bao" className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[#10B981] text-[9px] sm:text-[10px] font-black leading-tight">BAO ✋</span>
                <span className="text-[8px] text-white/50 leading-none truncate">Bọc Búa</span>
              </div>
            </div>
          </div>

          {/* 2 Vòng đấu Strip */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="p-1.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[#38BDF8] font-black uppercase text-[8px] tracking-wider">VÒNG 1: KHỞI ĐỘNG</span>
                <b className="text-white text-[10px] sm:text-[11px] font-black leading-tight">5 Lượt Đấu Đầu</b>
              </div>
              <span className="text-[8px] sm:text-[9px] text-white/50">Lượt 1..5</span>
            </div>

            <div className="p-1.5 rounded-xl bg-[#00D89A]/10 border border-[#00D89A]/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[#00D89A] font-black uppercase text-[8px] tracking-wider">VÒNG 2: TĂNG TỐC 🔥</span>
                <b className="text-white text-[10px] sm:text-[11px] font-black leading-tight">5 Lượt Chung Cuộc</b>
              </div>
              <span className="text-[8px] sm:text-[9px] text-[#00D89A] font-bold">Nghỉ 5s</span>
            </div>
          </div>

          {/* Player / Group Info Card */}
          <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-[#121c42]/90 to-[#0c1635]/90 border border-[#4C6DF0]/40 shadow-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A]/60 flex items-center justify-center p-0.5 shadow-sm shrink-0">
                <CharacterAvatar character={character} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider">
                  Đội thi đấu
                </span>
                <span className="text-xs sm:text-sm font-black text-white truncate">{profile.groupName}</span>
                <span className="text-[9px] text-[#00D89A] font-semibold">
                  Lớp: {profile.className}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSetup}
              className="min-h-[26px] px-2.5 py-0.5 rounded-lg bg-[#4C6DF0]/25 hover:bg-[#4C6DF0]/40 border border-[#4C6DF0]/60 text-white text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>✏️</span>
              <span>Đổi</span>
            </button>
          </div>

          {/* Lựa chọn độ khó AI */}
          <div className="flex flex-col gap-1 p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-black uppercase text-white/60 tracking-wider">
                🤖 Độ khó AI Thích Nghi (10 lượt)
              </span>
              <span className="text-[9px] font-bold text-[#00D89A]">
                {difficulty === 'hard' ? 'Thử thách cao' : difficulty === 'easy' ? 'Thử nghiệm nhẹ' : 'Cân bằng'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'easy', label: 'DỄ', desc: 'Học chậm, nhiệt độ cao', color: 'border-emerald-400 bg-emerald-500/20 text-emerald-300' },
                  { id: 'normal', label: 'THƯỜNG', desc: 'Bayes + Markov chuẩn', color: 'border-sky-400 bg-sky-500/20 text-sky-300' },
                  { id: 'hard', label: 'KHÓ', desc: 'Thích nghi & khai thác sâu', color: 'border-rose-400 bg-rose-500/20 text-rose-300' },
                ] as const
              ).map((opt) => {
                const isSelected = difficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectDifficulty(opt.id)}
                    className={`p-1 sm:p-1.5 rounded-lg border-2 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? `${opt.color} shadow-md font-black`
                        : 'border-white/10 bg-black/30 text-white/50 hover:text-white/80 hover:bg-white/5 font-semibold'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">{opt.label}</span>
                    <span className="text-[7.5px] sm:text-[8px] leading-tight opacity-75">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button - Chơi thuần AR */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={onStart}
              className="w-full min-h-[42px] sm:min-h-[46px] px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#00D89A] via-[#10B981] to-[#059669] text-[#022318] hover:shadow-[0_0_30px_rgba(0,216,154,0.7)] font-black text-xs sm:text-sm uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-base sm:text-lg">🖐️</span>
              <span>BẮT ĐẦU · XEM HƯỚNG DẪN AR</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* Right Preview Card: Chỉ hiển thị trên màn hình rộng Desktop (lg:) để không làm tràn màn hình Mobile */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#09112a]/85 border border-white/10 shadow-xl max-w-xs md:max-w-sm w-full animate-slide-right shrink-0">
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-black uppercase tracking-wider">
            <span>🎯</span>
            <span>Quy Ước Ra Chiêu</span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="flex flex-col items-center p-2 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40">
              <img src={RPS_CHOICES.rock.image} alt="Búa" className="w-12 h-12 object-contain" />
              <span className="text-[#F59E0B] text-xs font-black mt-1">BÚA (✊)</span>
              <span className="text-[9px] text-white/50">Đập Kéo</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40">
              <img src={RPS_CHOICES.scissors.image} alt="Kéo" className="w-12 h-12 object-contain" />
              <span className="text-[#EF4444] text-xs font-black mt-1">KÉO (✌️)</span>
              <span className="text-[9px] text-white/50">Cắt Bao</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40">
              <img src={RPS_CHOICES.paper.image} alt="Bao" className="w-12 h-12 object-contain" />
              <span className="text-[#10B981] text-xs font-black mt-1">BAO (✋)</span>
              <span className="text-[9px] text-white/50">Bọc Búa</span>
            </div>
          </div>

          <p className="text-[10px] text-white/70 text-center leading-relaxed">
            💡 <b>Quy tắc chơi:</b> Sử dụng <b>1 bàn tay duy nhất</b>. Trong 3s đếm ngược <i>Oẳn - Tù - Xì</i>, điều chỉnh thế tay chuẩn xác và giữ nguyên khi hết giờ!
          </p>
        </div>
      </main>

      {/* Footer Steps */}
      <footer className="py-1 border-t border-white/10 flex items-center justify-between gap-2 text-[9px] text-white/40 shrink-0 animate-slide-bottom">
        <div className="flex items-center gap-1.5 truncate">
          <span><b>01</b> Đếm nhịp 3s</span>
          <i>›</i>
          <span><b>02</b> Khóa thế tay</span>
          <i>›</i>
          <span><b>03</b> So tài 10 lượt</span>
        </div>
        <div className="text-[#00D89A] font-bold shrink-0">Oẳn Tù Xì AR · Manabie Lab</div>
      </footer>
    </div>
  );
}
