// Nhận diện cử chỉ Kéo - Búa - Bao (Oẳn Tù Xì) dựa trên 21 khớp Skeleton Bàn Tay
import { RPSChoice } from '../data/rps';

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface GestureDetectionResult {
  choice: RPSChoice | null;
  confidence: number;
  label: string;
  fingerStates: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
}

// Tính khoảng cách Euclidean 2D hoặc 3D giữa 2 điểm landmark
export function getDistance(p1: LandmarkPoint, p2: LandmarkPoint): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Phân loại cử chỉ bàn tay từ 21 điểm landmarks của MediaPipe
 * 0: Cổ tay (Wrist)
 * 1-4: Ngón cái (Thumb)
 * 5-8: Ngón trỏ (Index)
 * 9-12: Ngón giữa (Middle)
 * 13-16: Ngón áp út (Ring)
 * 17-20: Ngón út (Pinky)
 */
export function detectRPSGesture(landmarks: LandmarkPoint[]): GestureDetectionResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      choice: null,
      confidence: 0,
      label: 'Chưa phát hiện bàn tay',
      fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    };
  }

  const wrist = landmarks[0];

  // Kiểm tra độ duỗi/co của 4 ngón chính
  // Ngón duỗi khi khoảng cách từ đầu ngón (Tip) đến cổ tay lớn hơn khớp giữa (PIP) đến cổ tay
  const indexExtended =
    getDistance(landmarks[8], wrist) > getDistance(landmarks[6], wrist) * 1.15 &&
    getDistance(landmarks[8], landmarks[5]) > getDistance(landmarks[6], landmarks[5]) * 1.1;

  const middleExtended =
    getDistance(landmarks[12], wrist) > getDistance(landmarks[10], wrist) * 1.15 &&
    getDistance(landmarks[12], landmarks[9]) > getDistance(landmarks[10], landmarks[9]) * 1.1;

  const ringExtended =
    getDistance(landmarks[16], wrist) > getDistance(landmarks[14], wrist) * 1.15 &&
    getDistance(landmarks[16], landmarks[13]) > getDistance(landmarks[14], landmarks[13]) * 1.1;

  const pinkyExtended =
    getDistance(landmarks[20], wrist) > getDistance(landmarks[18], wrist) * 1.15 &&
    getDistance(landmarks[20], landmarks[17]) > getDistance(landmarks[18], landmarks[17]) * 1.1;

  // Ngón cái duỗi khi đầu ngón cái (4) cách xa khớp gốc ngón út (17) hoặc khớp ngón trỏ (5)
  const thumbExtended =
    getDistance(landmarks[4], landmarks[17]) > getDistance(landmarks[2], landmarks[17]) * 1.15 ||
    getDistance(landmarks[4], wrist) > getDistance(landmarks[2], wrist) * 1.2;

  const fingerStates = {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
  };

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

  // 1. KÉO (Scissors): Ngón trỏ & ngón giữa duỗi; ngón nhẫn & ngón út co lại
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return {
      choice: 'scissors',
      confidence: 0.95,
      label: 'KÉO (✌️)',
      fingerStates,
    };
  }

  // 2. BÚA (Rock): Cả 4 ngón chính đều co lại (nắm đấm)
  if (extendedCount === 0 || (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended)) {
    return {
      choice: 'rock',
      confidence: 0.95,
      label: 'BÚA (✊)',
      fingerStates,
    };
  }

  // 3. BAO (Paper): Có từ 3 ngón trở lên duỗi thẳng (xòe bàn tay)
  if (extendedCount >= 3 || (indexExtended && middleExtended && ringExtended && pinkyExtended)) {
    return {
      choice: 'paper',
      confidence: 0.95,
      label: 'BAO (✋)',
      fingerStates,
    };
  }

  // Dự phòng: nếu chỉ 1 ngón duỗi (không phải kéo, không phải bao) thì nghiêng về búa
  if (extendedCount <= 1) {
    return {
      choice: 'rock',
      confidence: 0.65,
      label: 'BÚA (✊)',
      fingerStates,
    };
  }

  return {
    choice: null,
    confidence: 0.3,
    label: 'Đang nhận diện...',
    fingerStates,
  };
}

// 20 đoạn xương kết nối khung bàn tay
export const HAND_CONNECTIONS: [number, number][] = [
  // Ngón cái
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Ngón trỏ
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Ngón giữa
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ngón áp út
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Ngón út
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Vành lòng bàn tay
  [5, 9], [9, 13], [13, 17],
];
