// Module C — MarkovOrder1Model
// Mô hình chuỗi Markov bậc 1 có Bayesian Laplace Smoothing (alpha = 1)
// Ước lượng P_M1(j | i) = [N(i -> j) + alpha] / [N(i) + 3 * alpha]
import { ALL_RPS_CHOICES, RPSChoice } from '../data/rps';
import { ProbabilityDistribution } from './types';

export class MarkovOrder1Model {
  private readonly alpha: number;

  constructor(alpha: number = 1.0) {
    if (alpha <= 0) {
      throw new Error(`Tham số alpha phải lớn hơn 0. Nhận: ${alpha}`);
    }
    this.alpha = alpha;
  }

  /**
   * Dự đoán phân phối xác suất nước đi tiếp theo j dựa trên nước đi gần nhất i.
   * @param history Chuỗi nước đi trong quá khứ của người chơi (không chứa lượt hiện tại).
   */
  predict(history: readonly RPSChoice[]): {
    distribution: ProbabilityDistribution;
    transitionCountFromLast: number;
    totalTransitions: number;
  } {
    // Nếu chưa có nước đi nào (Lượt 1) hoặc chỉ có 1 nước đi (chưa có cặp chuyển tiếp)
    if (history.length === 0) {
      return {
        distribution: { rock: 1 / 3, paper: 1 / 3, scissors: 1 / 3 },
        transitionCountFromLast: 0,
        totalTransitions: 0,
      };
    }

    const lastChoice = history[history.length - 1];

    // Xây dựng ma trận đếm chuyển tiếp N(from -> to)
    const transitions: Record<RPSChoice, Record<RPSChoice, number>> = {
      rock: { rock: 0, paper: 0, scissors: 0 },
      paper: { rock: 0, paper: 0, scissors: 0 },
      scissors: { rock: 0, paper: 0, scissors: 0 },
    };

    let totalTransitions = 0;
    for (let k = 0; k < history.length - 1; k++) {
      const from = history[k];
      const to = history[k + 1];
      transitions[from][to] += 1;
      totalTransitions += 1;
    }

    const fromCounts = transitions[lastChoice];
    const nFrom = fromCounts.rock + fromCounts.paper + fromCounts.scissors;
    const denominator = nFrom + 3 * this.alpha;

    const rawDist: ProbabilityDistribution = {
      rock: (fromCounts.rock + this.alpha) / denominator,
      paper: (fromCounts.paper + this.alpha) / denominator,
      scissors: (fromCounts.scissors + this.alpha) / denominator,
    };

    return {
      distribution: this.normalize(rawDist),
      transitionCountFromLast: nFrom,
      totalTransitions,
    };
  }

  private normalize(dist: ProbabilityDistribution): ProbabilityDistribution {
    const sum = dist.rock + dist.paper + dist.scissors;
    if (sum === 0) {
      return { rock: 1 / 3, paper: 1 / 3, scissors: 1 / 3 };
    }
    return {
      rock: dist.rock / sum,
      paper: dist.paper / sum,
      scissors: dist.scissors / sum,
    };
  }
}
