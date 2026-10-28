// Phân tích thói quen và giải thích sau trận đấu (Debrief)
// Cung cấp thông tin khách quan, không gây hiểu lầm rằng AI đọc được suy nghĩ người chơi
import { RPSChoice, RPS_CHOICES } from '../data/rps';
import { AIPostMatchInsight, TurnRecord } from './types';

export function generatePostMatchInsight(records: readonly TurnRecord[]): AIPostMatchInsight {
  if (records.length === 0) {
    return {
      favoriteMove: 'rock',
      favoriteMovePercentage: 33,
      patternDetected: 'Chưa có dữ liệu',
      adaptabilityScore: 50,
      summaryText: 'Trận đấu chưa có dữ liệu quan sát.',
    };
  }

  const counts: Record<RPSChoice, number> = { rock: 0, paper: 0, scissors: 0 };
  for (const r of records) {
    counts[r.playerChoice] += 1;
  }

  const total = records.length;
  let favoriteMove: RPSChoice = 'rock';
  let maxCount = counts.rock;

  if (counts.paper > maxCount) {
    favoriteMove = 'paper';
    maxCount = counts.paper;
  }
  if (counts.scissors > maxCount) {
    favoriteMove = 'scissors';
    maxCount = counts.scissors;
  }

  const favoritePercentage = Math.round((maxCount / total) * 100);

  // Phân tích chuyển tiếp: Đổi chiêu hay giữ nguyên sau khi thắng/thua/hòa
  let switchAfterLoseCount = 0;
  let loseCount = 0;
  let repeatAfterWinCount = 0;
  let winCount = 0;

  for (let i = 0; i < records.length - 1; i++) {
    const cur = records[i];
    const next = records[i + 1];

    if (cur.result === 'lose') {
      loseCount++;
      if (next.playerChoice !== cur.playerChoice) {
        switchAfterLoseCount++;
      }
    } else if (cur.result === 'win') {
      winCount++;
      if (next.playerChoice === cur.playerChoice) {
        repeatAfterWinCount++;
      }
    }
  }

  let patternDetected = 'Lối chơi đa dạng, khó đoán';
  let summaryText = 'Bạn phân bổ khá đều các chiêu thức, không để lộ quy luật cố định.';

  if (favoritePercentage >= 50) {
    patternDetected = `Ưa chuộng ${RPS_CHOICES[favoriteMove].vietnameseName} (${favoritePercentage}%)`;
    summaryText = `Bạn có xu hướng chọn ${RPS_CHOICES[favoriteMove].vietnameseName} (${RPS_CHOICES[favoriteMove].emoji}) nhiều nhất trận (${maxCount}/${total} lượt).`;
  } else if (loseCount >= 2 && switchAfterLoseCount / loseCount >= 0.75) {
    patternDetected = 'Thường đổi chiêu sau khi thua';
    summaryText = 'Bạn thường đổi sang chiêu khác sau mỗi lần không thắng máy.';
  } else if (winCount >= 2 && repeatAfterWinCount / winCount >= 0.6) {
    patternDetected = 'Giữ nguyên chiêu vừa thắng';
    summaryText = 'Bạn có xu hướng tiếp tục dùng chiêu vừa mang lại chiến thắng.';
  }

  // Điểm biến thiên (Entropy / Adaptability Score 0..100)
  // Tính entropy của 3 lựa chọn
  let entropy = 0;
  for (const choice of ['rock', 'paper', 'scissors'] as RPSChoice[]) {
    const p = counts[choice] / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  const maxEntropy = Math.log2(3); // ~ 1.585
  const adaptabilityScore = Math.min(100, Math.round((entropy / maxEntropy) * 100));

  return {
    favoriteMove,
    favoriteMovePercentage: favoritePercentage,
    patternDetected,
    adaptabilityScore,
    summaryText,
  };
}
