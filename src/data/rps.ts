// Dữ liệu & Logic trò chơi Oẳn Tù Xì (Kéo - Búa - Bao)
// Tích hợp từ https://github.com/thomasblom/casino-rock-paper-scissors.git

export type RPSChoice = 'rock' | 'paper' | 'scissors';
export type RPSResult = 'win' | 'lose' | 'draw';

export interface RPSChoiceDef {
  id: RPSChoice;
  name: string;
  vietnameseName: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  beats: RPSChoice;
  beatenBy: RPSChoice;
  verb: string; // "đập", "bọc", "cắt"
  image: string; // Base64 PNG image from casino-rock-paper-scissors
}

// 3 hình ảnh chuẩn trích xuất từ casino-rock-paper-scissors
export const RPS_CHOICES: Record<RPSChoice, RPSChoiceDef> = {
  rock: {
    id: 'rock',
    name: 'Rock',
    vietnameseName: 'BÚA',
    emoji: '✊',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
    beats: 'scissors',
    beatenBy: 'paper',
    verb: 'đập',
    image: '/assets/rps/rock.png',
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    vietnameseName: 'BAO',
    emoji: '✋',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    beats: 'rock',
    beatenBy: 'scissors',
    verb: 'bọc',
    image: '/assets/rps/paper.png',
  },
  scissors: {
    id: 'scissors',
    name: 'Scissors',
    vietnameseName: 'KÉO',
    emoji: '✌️',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    beats: 'paper',
    beatenBy: 'rock',
    verb: 'cắt',
    image: '/assets/rps/scissors.png',
  },
};

export const ALL_RPS_CHOICES: RPSChoice[] = ['rock', 'paper', 'scissors'];

/**
 * Xác định kết quả giữa người chơi và máy
 */
export function evaluateRPS(player: RPSChoice, ai: RPSChoice): {
  result: RPSResult;
  message: string;
  detail: string;
} {
  if (player === ai) {
    return {
      result: 'draw',
      message: 'HÒA NHAU!',
      detail: `Cả hai cùng ra ${RPS_CHOICES[player].vietnameseName} (${RPS_CHOICES[player].emoji})`,
    };
  }

  if (RPS_CHOICES[player].beats === ai) {
    return {
      result: 'win',
      message: 'BẠN CHIẾN THẮNG!',
      detail: `${RPS_CHOICES[player].vietnameseName} (${RPS_CHOICES[player].emoji}) ${RPS_CHOICES[player].verb} ${RPS_CHOICES[ai].vietnameseName} (${RPS_CHOICES[ai].emoji})`,
    };
  }

  return {
    result: 'lose',
    message: 'MÁY CHIẾN THẮNG!',
    detail: `${RPS_CHOICES[ai].vietnameseName} (${RPS_CHOICES[ai].emoji}) ${RPS_CHOICES[ai].verb} ${RPS_CHOICES[player].vietnameseName} (${RPS_CHOICES[player].emoji})`,
  };
}

/**
 * Random ngẫu nhiên một lựa chọn cho AI
 */
export function getRandomAIChoice(): RPSChoice {
  const index = Math.floor(Math.random() * ALL_RPS_CHOICES.length);
  return ALL_RPS_CHOICES[index];
}
