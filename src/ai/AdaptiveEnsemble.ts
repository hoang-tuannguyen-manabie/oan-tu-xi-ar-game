// Module D — AdaptiveEnsemble
// Kết hợp BayesianFrequencyModel và MarkovOrder1Model với trọng số thích nghi (Adaptive Weighting)
// Đánh giá hiệu năng bằng Log Loss và điều chỉnh trọng số lambda theo từng lượt.
import { ALL_RPS_CHOICES, RPSChoice } from '../data/rps';
import { ModelWeights, ProbabilityDistribution } from './types';

export interface AdaptiveEnsembleConfig {
  initialLambda?: number;
  learningRate?: number;
  minLambda?: number;
  maxLambda?: number;
}

export class AdaptiveEnsemble {
  private lambda: number;
  private readonly initialLambda: number;
  private readonly learningRate: number;
  private readonly minLambda: number;
  private readonly maxLambda: number;
  private readonly epsilon: number = 1e-4; // Ngăn chặn log(0) gây -Infinity

  // Lịch sử tích lũy log loss để theo dõi hiệu năng
  private cumulativeFreqLoss: number = 0;
  private cumulativeMarkovLoss: number = 0;
  private evaluatedTurns: number = 0;

  constructor(config: AdaptiveEnsembleConfig = {}) {
    this.initialLambda = config.initialLambda ?? 0.15;
    this.learningRate = config.learningRate ?? 0.25;
    this.minLambda = config.minLambda ?? 0.05;
    this.maxLambda = config.maxLambda ?? 0.85;
    this.lambda = this.initialLambda;
  }

  /**
   * Kết hợp 2 mô hình theo trọng số lambda hiện tại:
   * P_final(j) = (1 - lambda_eff) * P_freq(j) + lambda_eff * P_M1(j)
   * Trong đó lambda_eff được điều tiết theo số lượng chuyển tiếp đã có để tránh overfitting khi ít dữ liệu.
   */
  combine(
    pFreq: ProbabilityDistribution,
    pMarkov: ProbabilityDistribution,
    totalTransitions: number
  ): {
    finalDistribution: ProbabilityDistribution;
    weights: ModelWeights;
  } {
    // Hệ số tin cậy chuyển tiếp Markov: Khi totalTransitions = 0 -> dataFactor = 0 (100% tần suất)
    // Khi totalTransitions >= 4 -> dataFactor tiến dần đến 0.67 - 0.8
    const dataFactor = totalTransitions / (totalTransitions + 2.0);
    const effectiveLambda = Math.max(
      this.minLambda,
      Math.min(this.maxLambda, this.lambda * dataFactor)
    );

    const freqWeight = 1.0 - effectiveLambda;
    const markovWeight = effectiveLambda;

    const raw: ProbabilityDistribution = {
      rock: freqWeight * pFreq.rock + markovWeight * pMarkov.rock,
      paper: freqWeight * pFreq.paper + markovWeight * pMarkov.paper,
      scissors: freqWeight * pFreq.scissors + markovWeight * pMarkov.scissors,
    };

    const finalDistribution = this.normalize(raw);

    return {
      finalDistribution,
      weights: {
        lambda: effectiveLambda,
        freqWeight,
        markovWeight,
      },
    };
  }

  /**
   * Tính Log Loss của một phân phối xác suất đối với nước đi thực tế:
   * Loss = -ln(max(epsilon, P[actual]))
   */
  computeLogLoss(dist: ProbabilityDistribution, actual: RPSChoice): number {
    const prob = Math.max(this.epsilon, Math.min(1.0, dist[actual]));
    return -Math.log(prob);
  }

  /**
   * Cập nhật trọng số lambda dựa trên Log Loss thực tế của lượt vừa hoàn tất:
   * - Nếu Markov dự đoán tốt hơn Frequency (Loss_markov < Loss_freq) -> Tăng lambda
   * - Nếu Frequency dự đoán tốt hơn -> Giảm lambda
   * - Sử dụng hàm tanh để chặn biến động đột ngột từ 1 lượt đơn lẻ
   */
  updateWeights(
    pFreq: ProbabilityDistribution,
    pMarkov: ProbabilityDistribution,
    actual: RPSChoice,
    totalTransitions: number
  ): {
    freqLoss: number;
    markovLoss: number;
    newLambda: number;
  } {
    const freqLoss = this.computeLogLoss(pFreq, actual);
    const markovLoss = this.computeLogLoss(pMarkov, actual);

    this.cumulativeFreqLoss += freqLoss;
    this.cumulativeMarkovLoss += markovLoss;
    this.evaluatedTurns += 1;

    // deltaLoss > 0 nghĩa là Markov chính xác hơn Frequency ở lượt này
    const deltaLoss = freqLoss - markovLoss;

    // Trọng số dữ liệu: chuyển tiếp càng nhiều thì độ tin cậy càng cao
    const transitionConfidence = totalTransitions / (totalTransitions + 2.0);

    // Cập nhật gia tăng mượt mà bằng tanh
    const deltaLambda = this.learningRate * Math.tanh(deltaLoss) * transitionConfidence;

    this.lambda = Math.max(this.minLambda, Math.min(this.maxLambda, this.lambda + deltaLambda));

    return {
      freqLoss,
      markovLoss,
      newLambda: this.lambda,
    };
  }

  getWeights(): ModelWeights {
    return {
      lambda: this.lambda,
      freqWeight: 1 - this.lambda,
      markovWeight: this.lambda,
    };
  }

  getCumulativeStats() {
    return {
      evaluatedTurns: this.evaluatedTurns,
      avgFreqLoss: this.evaluatedTurns > 0 ? this.cumulativeFreqLoss / this.evaluatedTurns : 0,
      avgMarkovLoss: this.evaluatedTurns > 0 ? this.cumulativeMarkovLoss / this.evaluatedTurns : 0,
      currentLambda: this.lambda,
    };
  }

  reset(): void {
    this.lambda = this.initialLambda;
    this.cumulativeFreqLoss = 0;
    this.cumulativeMarkovLoss = 0;
    this.evaluatedTurns = 0;
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
