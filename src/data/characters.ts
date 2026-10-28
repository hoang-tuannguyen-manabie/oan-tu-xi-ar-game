const base = (import.meta as any).env?.BASE_URL || '/';
const asset = (relPath: string) => `${base}${relPath.replace(/^\/+/, '')}`;

export interface PlayerCharacter {
  id: string;
  name: string;
  image: string;
  row: number;
  col: number;
  /** Tọa độ thực tế (px) đã đo trên sprite sheet 1024x969 */
  cropRect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PlayerProfile {
  groupName: string;
  className: string;
  playerName?: string;
  characterId: string;
  characterImage: string;
  characterName: string;
}

// Lấy trực tiếp từ folder asset/Character.png trong chính thư mục dự án
export const CHARACTERS_SPRITE_SHEET = asset('asset/Character.png');

export const PLAYER_PROFILE_STORAGE_KEY = 'manabie_oan_tu_ti_player_profile_2026';

// Tọa độ cột và hàng thực tế đã phân tích trên ảnh sprite sheet tách nền 513x486
const COL_RANGES: Array<[number, number]> = [
  [10, 90],
  [99, 168],
  [179, 254],
  [260, 331],
  [343, 417],
  [429, 500],
];

const ROW_RANGES: Array<[number, number]> = [
  [26, 104],
  [112, 185],
  [191, 265],
  [271, 338],
  [347, 412],
  [418, 477],
];

const CHARACTER_NAMES: string[] = [
  // Hàng 1
  'Mana thông thái',
  'Robot Nano Xanh',
  'Thỏ Trắng Tinh Anh',
  'Cáo Cam Phi Hành',
  'Gấu Trúc Tre Xanh',
  'Cánh Cụt Mũ Len',
  // Hàng 2
  'Mèo Tím Vũ Trụ',
  'Gà Vàng Năng Động',
  'Quái Nhỏ Một Mắt',
  'Khủng Long Xanh Ngọc',
  'Mèo Trắng Đọc Sách',
  'Bạn Nhỏ Sao Hỏa',
  // Hàng 3
  'Bạn Nhỏ Sao Mộc',
  'Cừu Bông Học Bá',
  'Hổ Ngầu Kính Râm',
  'Thỏ Hồng Nơ Xinh',
  'Gấu Koala Xanh',
  'Robot Trắng Tương Lai',
  // Hàng 4
  'Tuần Lộc Khăn Xanh',
  'Cánh Cụt Kính Bơi',
  'Rồng Tím Đáng Yêu',
  'Ếch Xanh Vui Nhộn',
  'Bé Sao Băng Xanh',
  'Cáo Đỏ Thám Hiểm',
  // Hàng 5
  'Kỳ Lân Cầu Vồng',
  'Cú Nâu Thông Thái',
  'Sứa Biển Phát Sáng',
  'Cún Vàng Đáng Yêu',
  'Nấm Đỏ Tinh Nghịch',
  'Robot Mèo Cyber',
  // Hàng 6
  'Cá Voi Đại Dương',
  'Mầm Xanh Hiếu Học',
  'Cua Đỏ Vui Vẻ',
  'Cú Xanh Đọc Sách',
  'Hà Mã Thân Thiện',
  'Rồng Con Lửa Vàng',
];

export const PLAYER_CHARACTERS: PlayerCharacter[] = (() => {
  const list: PlayerCharacter[] = [];
  let index = 0;
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const [colStart, colEnd] = COL_RANGES[col];
      const [rowStart, rowEnd] = ROW_RANGES[row];
      const width = colEnd - colStart;
      const height = rowEnd - rowStart;
      const name = CHARACTER_NAMES[index] || `Nhân vật ${index + 1}`;
      list.push({
        id: `char-${row}-${col}`,
        name,
        image: CHARACTERS_SPRITE_SHEET,
        row,
        col,
        cropRect: {
          x: colStart,
          y: rowStart,
          width,
          height,
        },
      });
      index++;
    }
  }
  return list;
})();

export function getCharacterById(id: string): PlayerCharacter {
  const found = PLAYER_CHARACTERS.find((c) => c.id === id);
  return found || PLAYER_CHARACTERS[0];
}

export function loadSavedPlayerProfile(): PlayerProfile | null {
  try {
    const raw = sessionStorage.getItem(PLAYER_PROFILE_STORAGE_KEY) || localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.characterId === 'string' && typeof parsed.groupName === 'string') {
      return parsed;
    }
  } catch {
    // Ignore error
  }
  return null;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    const raw = JSON.stringify(profile);
    sessionStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, raw);
    localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, raw);
  } catch {
    // Ignore error
  }
}
