// Module B — BayesianFrequencyModel
// Ước lượng xác suất lựa chọn của người chơi dựa trên tần suất lịch sử kết hợp Bayesian smoothing (Laplace prior)
import { ALL_RPS_CHOICES, RPSChoice } from '../data/rps';
import { ProbabilityDistribution } from './types';

export class BayesianFrequencyModel {
  private readonly alpha: number;

  constructor(alpha: number = 1.0) {
    if (alpha <= 0) {
      throw new Error(`Tham số làm mượt alpha phải lớn hơn 0. Nhận: ${alpha}`);
    }
    this.alpha = alpha;
  }

  /**
   * Tính toán phân phối xác suất P_freq(j) = (N_j + alpha) / (n + 3 * alpha)
   * @param history Danh sách các nước đi trong quá khứ của người chơi
   */
  predict(history: readonly RPSChoice[]): ProbabilityDistribution {
    const n = history.length;
    const counts: Record<RPSChoice, number> = {
      rock: 0,
      paper: 0,
      scissors: 0,
    };

    for (const choice of history) {
      counts[choice] += 1;
    }

    const denominator = n + 3 * this.alpha;
    const distribution: ProbabilityDistribution = {
      rock: (counts.rock + this.alpha) / denominator,
      paper: (counts.paper + this.alpha) / denominator,
      scissors: (counts.scissors + this.alpha) / denominator,
    };

    // Chuẩn hóa đảm bảo tổng chính xác bằng 1.0
    return this.normalize(distribution);
  }

  /**
   * Chuẩn hóa xác suất để tổng luôn bằng 1.0
   */
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
