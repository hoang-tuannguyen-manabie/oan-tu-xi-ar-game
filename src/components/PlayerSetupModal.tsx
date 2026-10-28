import React, { useEffect, useState } from 'react';
import {
  CHARACTERS_SPRITE_SHEET,
  getCharacterById,
  PLAYER_CHARACTERS,
  PlayerCharacter,
  PlayerProfile,
} from '../data/characters';
import { audio } from '../utils/audio';

export { getCharacterById };

interface PlayerSetupModalProps {
  open: boolean;
  initialProfile: PlayerProfile | null;
  onConfirm: (profile: PlayerProfile) => void;
  onClose?: () => void;
}

export function CharacterAvatar({
  character,
  className = 'w-full h-full',
}: {
  character: PlayerCharacter;
  className?: string;
  imgClassName?: string;
}) {
  const { x, y, width, height } = character.cropRect;
  // Sprite sheet tách nền 513x486
  const bgPosX = (x / (513 - width)) * 100;
  const bgPosY = (y / (486 - height)) * 100;
  const bgSizeX = (513 / width) * 100;
  const bgSizeY = (486 / height) * 100;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center select-none ${className}`}>
      <div
        role="img"
        aria-label={character.name}
        className="w-full h-full rounded-xl"
        style={{
          backgroundImage: `url(${CHARACTERS_SPRITE_SHEET})`,
          backgroundPosition: `${bgPosX.toFixed(3)}% ${bgPosY.toFixed(3)}%`,
          backgroundSize: `${bgSizeX.toFixed(3)}% ${bgSizeY.toFixed(3)}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}

export function PlayerSetupModal({
  open,
  initialProfile,
  onConfirm,
}: PlayerSetupModalProps) {
  const [groupName, setGroupName] = useState<string>(initialProfile?.groupName ?? 'Đội Chiến Binh AI');
  const [className, setClassName] = useState<string>(initialProfile?.className ?? '10A1');
  const [selectedCharId, setSelectedCharId] = useState<string>(
    initialProfile?.characterId ?? PLAYER_CHARACTERS[0].id
  );
  const [activeTab, setActiveTab] = useState<'info' | 'character'>('info');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialProfile) {
        setGroupName(initialProfile.groupName || 'Đội Chiến Binh AI');
        setClassName(initialProfile.className || '10A1');
        setSelectedCharId(initialProfile.characterId || PLAYER_CHARACTERS[0].id);
      }
      setErrorMsg(null);
    }
  }, [open, initialProfile]);

  if (!open) return null;

  const selectedChar = getCharacterById(selectedCharId);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanGroup = groupName.trim();
    const cleanClass = className.trim();

    if (!cleanGroup) {
      setErrorMsg('Vui lòng nhập tên nhóm / đội chơi!');
      setActiveTab('info');
      return;
    }
    if (!cleanClass) {
      setErrorMsg('Vui lòng nhập tên lớp!');
      setActiveTab('info');
      return;
    }

    audio.playClick();
    onConfirm({
      groupName: cleanGroup,
      className: cleanClass,
      characterId: selectedChar.id,
      characterImage: selectedChar.image,
      characterName: selectedChar.name,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-setup-title"
    >
      <div className="relative w-full max-w-xl max-h-[96dvh] rounded-3xl bg-gradient-to-b from-[#0b132e] via-[#080d22] to-[#040713] border border-[#00D89A]/50 shadow-[0_0_50px_rgba(0,216,154,0.3)] flex flex-col overflow-hidden animate-modal-dialog">
        {/* Header */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl sm:text-2xl">✌️</span>
            <div>
              <h2 id="player-setup-title" className="text-sm sm:text-base font-black text-white tracking-wider">
                THÔNG TIN ĐỘI CHƠI & NHÂN VẬT
              </h2>
              <p className="text-[10px] sm:text-xs text-[#00D89A] font-bold">
                Oẳn Tù Xì AR · 2 Vòng Đấu 10 Lượt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setActiveTab('info');
              }}
              className={`px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                activeTab === 'info'
                  ? 'bg-[#00D89A] text-[#022318] shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              1. Tên Đội
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                setActiveTab('character');
              }}
              className={`px-3 py-1 rounded-lg font-black text-xs transition-all cursor-pointer ${
                activeTab === 'character'
                  ? 'bg-[#00D89A] text-[#022318] shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              2. Chọn Avatar
            </button>
          </div>
        </div>

        {/* Body Container - Gọn gàng trên 1 màn hình */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-center min-h-0">
          {errorMsg && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'info' ? (
            /* TAB 1: THÔNG TIN ĐỘI CHƠI */
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4C6DF0]/30 to-[#00D89A]/30 border border-[#00D89A] p-0.5 shadow-md shrink-0">
                  <CharacterAvatar character={selectedChar} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Avatar Đã Chọn
                  </span>
                  <span className="text-sm font-black text-white">{selectedChar.name}</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('character')}
                    className="text-[11px] text-[#00D89A] hover:underline font-bold text-left mt-0.5 cursor-pointer"
                  >
                    Bấm để đổi nhân vật khác →
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-1">
                  Tên Nhóm / Đội Chơi <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={groupName}
                  onChange={(e) => {
                    setGroupName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ví dụ: Đội Sấm Sét, Nhóm 1..."
                  className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-[#00D89A] focus:bg-white/15 text-white text-sm font-bold outline-none transition-all placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-white/70 mb-1">
                  Lớp / Đơn Vị <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={className}
                  onChange={(e) => {
                    setClassName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Ví dụ: 10A1, 11 Chuyên Lý..."
                  className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/20 focus:border-[#00D89A] focus:bg-white/15 text-white text-sm font-bold outline-none transition-all placeholder:text-white/30"
                />
              </div>
            </form>
          ) : (
            /* TAB 2: CHỌN AVATAR (36 Nhân Vật Xếp Gọn 9x4, Không Scroll) */
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Chọn 1 trong 36 nhân vật đại diện:</span>
                <span className="text-[#00D89A] font-black">{selectedChar.name}</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 rounded-2xl bg-black/40 border border-white/10 max-h-[46dvh] overflow-y-auto pr-1">
                {PLAYER_CHARACTERS.map((char) => {
                  const isSelected = char.id === selectedCharId;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => {
                        audio.playClick();
                        setSelectedCharId(char.id);
                      }}
                      title={char.name}
                      className={`relative aspect-square rounded-xl p-1 transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#00D89A]/30 border-2 border-[#00D89A] shadow-[0_0_12px_rgba(0,216,154,0.6)] scale-105 z-10'
                          : 'bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30'
                      }`}
                    >
                      <CharacterAvatar character={char} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 bg-white/5">
          <span className="text-[11px] text-white/50">
            {activeTab === 'info' ? 'Bước 1/2' : 'Bước 2/2: Đã chọn ' + selectedChar.name}
          </span>

          <div className="flex items-center gap-2">
            {activeTab === 'character' ? (
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setActiveTab('info');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer"
              >
                ← Quay Lại
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#00D89A] to-[#10B981] hover:from-[#10B981] hover:to-[#059669] text-[#022318] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,216,154,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Vào Thi Đấu ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
