// Module E — StrategySelector
// Tính toán lợi ích kỳ vọng (Expected Utility), chuyển đổi qua Softmax có nhiệt độ (Temperature tau)
// và lấy mẫu ngẫu nhiên có trọng số (Weighted Random Sampling) với bộ sinh số ngẫu nhiên tiêm được.
import { ALL_RPS_CHOICES, RPSChoice } from '../data/rps';
import { ExpectedUtilities, ProbabilityDistribution } from './types';

export class StrategySelector {
  /**
   * Tính điểm lợi ích kỳ vọng của từng nước đi AI:
   * - U_R = p_S - p_P (Búa đập Kéo [+1], bị Bao bọc [-1], hòa Búa [0])
   * - U_P = p_R - p_S (Bao bọc Búa [+1], bị Kéo cắt [-1], hòa Bao [0])
   * - U_S = p_P - p_R (Kéo cắt Bao [+1], bị Búa đập [-1], hòa Kéo [0])
   */
  computeExpectedUtilities(playerProbabilities: ProbabilityDistribution): ExpectedUtilities {
    const { rock: pR, paper: pP, scissors: pS } = playerProbabilities;
    return {
      rock: pS - pP,
      paper: pR - pS,
      scissors: pP - pR,
    };
  }

  /**
   * Áp dụng Softmax với nhiệt độ tau và ổn định số học (subtract max):
   * P_AI(a) = exp(U_a / tau) / sum_b exp(U_b / tau)
   * @param utilities Điểm lợi ích kỳ vọng
   * @param temperature Tham số nhiệt độ tau (> 0)
   */
  computeSoftmaxProbabilities(
    utilities: ExpectedUtilities,
    temperature: number
  ): ProbabilityDistribution {
    const tau = Math.max(0.01, temperature); // Đảm bảo không chia cho 0 hoặc âm

    // Ổn định số học: trừ đi giá trị max để tránh overflow exp()
    const maxU = Math.max(utilities.rock, utilities.paper, utilities.scissors);

    const expR = Math.exp((utilities.rock - maxU) / tau);
    const expP = Math.exp((utilities.paper - maxU) / tau);
    const expS = Math.exp((utilities.scissors - maxU) / tau);

    const sumExp = expR + expP + expS;

    if (sumExp === 0 || !isFinite(sumExp)) {
      return { rock: 1 / 3, paper: 1 / 3, scissors: 1 / 3 };
    }

    return {
      rock: expR / sumExp,
      paper: expP / sumExp,
      scissors: expS / sumExp,
    };
  }

  /**
   * Lấy mẫu ngẫu nhiên có trọng số từ phân phối xác suất.
   * @param distribution Phân phối xác suất (tổng bằng 1.0)
   * @param rng Hàm sinh số ngẫu nhiên [0, 1), mặc định là Math.random
   */
  sampleChoice(
    distribution: ProbabilityDistribution,
    rng: () => number = Math.random
  ): RPSChoice {
    const rand = rng();

    // Cumulative distribution sampling
    const pRock = distribution.rock;
    const pPaper = distribution.paper;

    if (rand < pRock) {
      return 'rock';
    }
    if (rand < pRock + pPaper) {
      return 'paper';
    }
    return 'scissors';
  }
}
