import { AIDifficulty } from '../ai';
import { MANABIE_MARK } from '../data/brand';
import { PlayerProfile } from '../data/characters';
import { RPS_CHOICES } from '../data/rps';
import { CharacterAvatar, getCharacterById } from './PlayerSetupModal';

interface IntroProps {
  profile: PlayerProfile;
  difficulty: AIDifficulty;
  onSelectDifficulty: (d: AIDifficulty) => void;
  onOpenSetup: () => void;
  onStart: () => void;
}

export function Intro({ profile, difficulty, onSelectDifficulty, onOpenSetup, onStart }: IntroProps) {
  const character = getCharacterById(profile.characterId);

  return (
    <div className="workshop-stage force-motion flex-1 flex flex-col justify-between p-3 sm:p-5 overflow-hidden h-full">
      {/* Background atmosphere */}
      <div className="workshop-atmosphere" aria-hidden="true">
        <span className="workshop-grid" />
        <span className="workshop-scanline" />
        <span className="workshop-glow workshop-glow-a" />
        <span className="workshop-glow workshop-glow-b" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between gap-3 pb-2 border-b border-white/10 shrink-0 animate-slide-top">
        <div className="flex items-center gap-2.5">
          <img className="h-6 sm:h-7 object-contain" src={MANABIE_MARK} alt="Manabie" />
          <div className="flex flex-col">
            <span className="text-white font-black text-xs sm:text-sm tracking-wider">MANABIE AI LAB</span>
            <span className="text-[#00D89A] text-[10px] font-bold">HOẠT ĐỘNG KHỞI ĐỘNG AR</span>
          </div>
        </div>

        <div className="px-2.5 py-0.5 rounded-full bg-[#00D89A]/15 border border-[#00D89A]/40 text-[#00D89A] text-[10px] font-black tracking-wider uppercase">
          ● SẴN SÀNG
        </div>
      </header>

      {/* Main Content - Cố gắng vừa vặn trên 1 màn hình */}
      <main className="my-auto py-2 flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8 max-w-5xl mx-auto w-full">
        {/* Left Column: Titles, Rule, Actions */}
        <div className="flex flex-col gap-2.5 max-w-lg w-full animate-slide-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-[#4C6DF0]/25 border border-[#4C6DF0]/40 text-[#8ba2ff] text-[10px] font-black uppercase tracking-wider">
              Khởi động AR
            </span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-[#F4BE4F] text-[10px] sm:text-xs font-bold">Skeleton Khớp Bàn Tay</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            OẲN TÙ XÌ <br />
            <span className="bg-gradient-to-r from-[#F59E0B] via-[#EF4444] to-[#10B981] bg-clip-text text-transparent">
              ĐẤU TRÍ VỚI AI
            </span>
          </h1>

          <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
            Dùng <b>Skeleton AR bàn tay</b>: Trước mỗi lượt đấu, màn hình hiển thị{' '}
            <b className="text-[#F59E0B]">OẲN - TÙ - XÌ</b> rung giật trong <b>3 giây</b> đếm ngược. Hệ thống sẽ ghi nhận tư thế tay sau cùng để so tài với AI!
          </p>

          {/* Quick Metrics: 2 Vòng chơi (Mỗi vòng 5 lượt đấu + Gap 5s) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/35 flex flex-col">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="text-[#38BDF8] font-black uppercase text-[10px]">VÒNG 1: KHỞI ĐỘNG</span>
              </div>
              <b className="text-white text-xs sm:text-sm font-black mt-0.5">5 Lượt Đấu Đầu Tiên</b>
              <span className="text-[10px] text-white/60">Người chơi 1 làm quen</span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-xl bg-[#00D89A]/10 border border-[#00D89A]/35 flex flex-col">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00D89A] animate-ping" />
                <span className="text-[#00D89A] font-black uppercase text-[10px]">VÒNG 2: TĂNG TỐC 🔥</span>
              </div>
              <b className="text-white text-xs sm:text-sm font-black mt-0.5">5 Lượt Đấu Chung Cuộc</b>
              <span className="text-[10px] text-[#00D89A] font-bold">Nghỉ 5s cho người chơi 2</span>
            </div>
          </div>

          {/* Player / Group Info Card */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-[#121c42]/90 to-[#0c1635]/90 border border-[#4C6DF0]/40 shadow-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A]/60 flex items-center justify-center p-0.5 shadow-md shrink-0">
                <CharacterAvatar character={character} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">
                  Đội thi đấu
                </span>
                <span className="text-xs sm:text-sm font-black text-white">{profile.groupName}</span>
                <span className="text-[10px] text-[#00D89A] font-semibold">
                  Lớp: {profile.className}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSetup}
              className="min-h-[34px] px-3 py-1 rounded-xl bg-[#4C6DF0]/25 hover:bg-[#4C6DF0]/40 border border-[#4C6DF0]/60 text-white text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>✏️</span>
              <span>Đổi</span>
            </button>
          </div>

          {/* Lựa chọn độ khó AI */}
          <div className="flex flex-col gap-1 p-2 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">
                🤖 Độ khó AI Thích Nghi (10 lượt)
              </span>
              <span className="text-[10px] font-bold text-[#00D89A]">
                {difficulty === 'hard' ? 'Thử thách cao' : difficulty === 'easy' ? 'Thử nghiệm nhẹ' : 'Cân bằng'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'easy', label: 'DỄ', desc: 'Học chậm, nhiệt độ cao', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
                  { id: 'normal', label: 'THƯỜNG', desc: 'Bayes + Markov chuẩn', color: 'border-sky-500/50 text-sky-400 bg-sky-500/10' },
                  { id: 'hard', label: 'KHÓ', desc: 'Thích nghi & khai thác sâu', color: 'border-rose-500/50 text-rose-400 bg-rose-500/10' },
                ] as const
              ).map((opt) => {
                const isSelected = difficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectDifficulty(opt.id)}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? `${opt.color} ring-2 ring-white/30 shadow-md font-black`
                        : 'border-white/10 bg-black/20 text-white/50 hover:text-white/80 hover:bg-white/5 font-semibold'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider">{opt.label}</span>
                    <span className="text-[8px] leading-tight opacity-75">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button - Chơi thuần AR */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onStart}
              className="w-full min-h-[48px] px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00D89A] via-[#10B981] to-[#059669] text-[#022318] hover:shadow-[0_0_35px_rgba(0,216,154,0.7)] font-black text-sm uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <span className="text-xl">🖐️</span>
              <span>BẮT ĐẦU ĐẤU OẲN TÙ XÌ (CAMERA AR)</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* Right Preview Card: 3 Chiêu Thức Oẳn Tù Xì */}
        <div className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-3xl bg-[#09112a]/85 border border-white/10 shadow-xl max-w-sm w-full animate-slide-right">
          <div className="flex items-center gap-1.5 text-white/70 text-xs font-black uppercase tracking-wider">
            <span>🎯</span>
            <span>3 Dạng Ra Chiêu Bằng Tay</span>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="flex flex-col items-center p-2 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/40">
              <img src={RPS_CHOICES.rock.image} alt="Búa" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
              <span className="text-[#F59E0B] text-xs font-black mt-1">BÚA (✊)</span>
              <span className="text-[9px] text-white/50">Đập Kéo</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/40">
              <img src={RPS_CHOICES.scissors.image} alt="Kéo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
              <span className="text-[#EF4444] text-xs font-black mt-1">KÉO (✌️)</span>
              <span className="text-[9px] text-white/50">Cắt Bao</span>
            </div>

            <div className="flex flex-col items-center p-2 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/40">
              <img src={RPS_CHOICES.paper.image} alt="Bao" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
              <span className="text-[#10B981] text-xs font-black mt-1">BAO (✋)</span>
              <span className="text-[9px] text-white/50">Bọc Búa</span>
            </div>
          </div>

          <p className="text-[11px] text-white/70 text-center leading-relaxed">
            💡 <b>Quy tắc chơi:</b> Sử dụng <b>1 bàn tay duy nhất</b>. Trong 3s đếm ngược <i>Oẳn - Tù - Xì</i>, điều chỉnh thế tay chuẩn xác và giữ nguyên khi hết giờ!
          </p>
        </div>
      </main>

      {/* Footer Steps */}
      <footer className="py-1.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-white/50 shrink-0 animate-slide-bottom">
        <div className="flex items-center gap-2">
          <span><b>01</b> Đếm ngược 3s (Oẳn - Tù - Xì)</span>
          <i>›</i>
          <span><b>02</b> Ra chiêu tay sau cùng</span>
          <i>›</i>
          <span><b>03</b> So tài thắng bại với AI (10 lượt)</span>
        </div>
        <div className="text-[#00D89A] font-bold">Oẳn Tù Xì AR · Manabie AI Lab</div>
      </footer>
    </div>
  );
}
