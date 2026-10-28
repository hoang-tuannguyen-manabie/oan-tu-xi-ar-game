// Facade tổng hợp: AdaptiveRPSAI
// Kết nối 6 module A -> F thành một hệ thống AI Thích Nghi hoàn chỉnh, tuân thủ nghiêm ngặt quy trình 10 lượt và không rò rỉ dữ liệu.
import { RPSChoice, RPSResult } from '../data/rps';
import { AdaptiveEnsemble } from './AdaptiveEnsemble';
import { BayesianFrequencyModel } from './BayesianFrequencyModel';
import { DifficultyController } from './DifficultyController';
import { MarkovOrder1Model } from './MarkovOrder1Model';
import { OpponentProfiler } from './OpponentProfiler';
import { StrategySelector } from './StrategySelector';
import { generatePostMatchInsight } from './aiExplanation';
import {
  AIDifficulty,
  AIPostMatchInsight,
  ProbabilityDistribution,
  TurnPredictionOutcome,
  TurnRecord,
} from './types';

export interface AdaptiveRPSAIOptions {
  difficulty?: AIDifficulty;
  maxTurns?: number;
  rng?: () => number;
}

export class AdaptiveRPSAI {
  private readonly maxTurns: number;
  private readonly rng: () => number;

  private profiler: OpponentProfiler;
  private freqModel: BayesianFrequencyModel;
  private markovModel: MarkovOrder1Model;
  private ensemble: AdaptiveEnsemble;
  private strategySelector: StrategySelector;
  private difficultyController: DifficultyController;

  // Lưu trữ tạm dự đoán của lượt hiện tại trước khi người chơi chốt nước
  private pendingPrediction: {
    turnNumber: number;
    predictedPlayerProbabilities: ProbabilityDistribution;
    aiProbabilities: ProbabilityDistribution;
    pFreq: ProbabilityDistribution;
    pMarkov: ProbabilityDistribution;
    totalTransitions: number;
    chosenAIChoice: RPSChoice;
    weights: { lambda: number; freqWeight: number; markovWeight: number };
  } | null = null;

  constructor(options: AdaptiveRPSAIOptions = {}) {
    this.maxTurns = options.maxTurns ?? 10;
    this.rng = options.rng ?? Math.random;

    const diff = options.difficulty ?? 'normal';
    this.difficultyController = new DifficultyController(diff);
    const diffConfig = this.difficultyController.getConfig();

    this.profiler = new OpponentProfiler(this.maxTurns);
    this.freqModel = new BayesianFrequencyModel(diffConfig.priorAlpha);
    this.markovModel = new MarkovOrder1Model(diffConfig.priorAlpha);
    this.ensemble = new AdaptiveEnsemble({
      initialLambda: diffConfig.initialLambda,
      learningRate: diffConfig.learningRate,
      minLambda: diffConfig.minLambda,
      maxLambda: diffConfig.maxLambda,
    });
    this.strategySelector = new StrategySelector();
  }

  getDifficulty(): AIDifficulty {
    return this.difficultyController.getDifficulty();
  }

  setDifficulty(difficulty: AIDifficulty): void {
    this.difficultyController.setDifficulty(difficulty);
    const diffConfig = this.difficultyController.getConfig();
    this.ensemble = new AdaptiveEnsemble({
      initialLambda: diffConfig.initialLambda,
      learningRate: diffConfig.learningRate,
      minLambda: diffConfig.minLambda,
      maxLambda: diffConfig.maxLambda,
    });
  }

  /**
   * BƯỚC 1 CỦA MỖI LƯỢT: Chuẩn bị dự đoán và chọn nước AI TRƯỚC KHI người chơi ra chiêu.
   * TUYỆT ĐỐI KHÔNG chứa nước đi của người chơi ở lượt hiện tại.
   */
  prepareTurn(turnNumber: number): TurnPredictionOutcome {
    if (turnNumber < 1 || turnNumber > this.maxTurns) {
      throw new Error(`Số lượt ${turnNumber} nằm ngoài phạm vi trận đấu (1..${this.maxTurns}).`);
    }

    if (this.profiler.isMatchComplete()) {
      throw new Error(`Trận đấu đã kết thúc đủ ${this.maxTurns} lượt. Không thể chuẩn bị lượt tiếp theo.`);
    }

    // 1. Lấy lịch sử các lượt ĐÃ HOÀN TẤT
    const playerHistory = this.profiler.getPlayerChoiceSequence();

    // 2. Dự đoán phân phối bằng Bayesian Frequency
    const pFreq = this.freqModel.predict(playerHistory);

    // 3. Dự đoán phân phối bằng Markov Order 1
    const markovResult = this.markovModel.predict(playerHistory);
    const pMarkov = markovResult.distribution;

    // 4. Kết hợp qua Adaptive Ensemble
    const ensembleResult = this.ensemble.combine(
      pFreq,
      pMarkov,
      markovResult.totalTransitions
    );
    const predictedPlayerProbabilities = ensembleResult.finalDistribution;

    // 5. Tính điểm lợi ích kỳ vọng của từng nước AI
    const expectedUtilities = this.strategySelector.computeExpectedUtilities(
      predictedPlayerProbabilities
    );

    // 6. Tính phân phối Softmax theo nhiệt độ tau của độ khó
    const diffConfig = this.difficultyController.getConfig();
    const pSoftmax = this.strategySelector.computeSoftmaxProbabilities(
      expectedUtilities,
      diffConfig.temperature
    );

    // 7. Pha trộn mức độ khai thác (Exploitation) theo độ khó
    const aiProbabilities = this.difficultyController.blendWithExploitation(pSoftmax);

    // 8. Lấy mẫu ngẫu nhiên có trọng số để ra chiêu
    const chosenAIChoice = this.strategySelector.sampleChoice(aiProbabilities, this.rng);

    // Lưu lại vào cache chờ người chơi chốt nước
    this.pendingPrediction = {
      turnNumber,
      predictedPlayerProbabilities,
      aiProbabilities,
      pFreq,
      pMarkov,
      totalTransitions: markovResult.totalTransitions,
      chosenAIChoice,
      weights: ensembleResult.weights,
    };

    return {
      turnNumber,
      predictedPlayerProbabilities,
      aiProbabilities,
      expectedUtilities,
      chosenAIChoice,
      modelWeights: ensembleResult.weights,
      effectiveTemperature: diffConfig.temperature,
      effectiveExploitation: diffConfig.exploitation,
    };
  }

  /**
   * BƯỚC 2 CỦA MỖI LƯỢT: Sau khi người chơi đã khóa nước đi và kết quả đã xác định,
   * ghi nhận vào hồ sơ, đánh giá độ chính xác qua Log Loss, và cập nhật trọng số lambda.
   */
  recordTurnResult(
    turnNumber: number,
    playerChoice: RPSChoice,
    result: RPSResult
  ): TurnRecord {
    if (!this.pendingPrediction) {
      throw new Error(`Lượt ${turnNumber} chưa được gọi prepareTurn() trước khi ghi nhận kết quả.`);
    }

    if (this.pendingPrediction.turnNumber !== turnNumber) {
      throw new Error(
        `Lệch số lượt: Đang chờ lượt ${this.pendingPrediction.turnNumber} nhưng nhận kết quả lượt ${turnNumber}.`
      );
    }

    const {
      predictedPlayerProbabilities,
      aiProbabilities,
      pFreq,
      pMarkov,
      totalTransitions,
      chosenAIChoice,
      weights,
    } = this.pendingPrediction;

    // Tính Log Loss của phân phối dự đoán đối với lựa chọn thực tế của người chơi
    const logLoss = this.ensemble.computeLogLoss(predictedPlayerProbabilities, playerChoice);

    // Cập nhật trọng số thích nghi của Ensemble cho các lượt kế tiếp
    this.ensemble.updateWeights(pFreq, pMarkov, playerChoice, totalTransitions);

    // Đóng gói bản ghi hoàn tất
    const record: TurnRecord = {
      turnNumber,
      playerChoice,
      aiChoice: chosenAIChoice,
      result,
      predictedPlayerProbabilities,
      aiProbabilities,
      modelWeights: weights,
      logLoss,
      timestamp: Date.now(),
    };

    // Lưu vào OpponentProfiler
    this.profiler.recordTurn(record);

    // Xóa bộ nhớ đệm lượt hiện tại
    this.pendingPrediction = null;

    return record;
  }

  /**
   * Lấy lựa chọn đã được AI chốt sẵn cho lượt hiện tại (nếu đã gọi prepareTurn).
   */
  getPendingAIChoice(): RPSChoice | null {
    return this.pendingPrediction?.chosenAIChoice ?? null;
  }

  getPendingPrediction() {
    return this.pendingPrediction;
  }

  getHistory(): readonly TurnRecord[] {
    return this.profiler.getHistory();
  }

  isMatchComplete(): boolean {
    return this.profiler.isMatchComplete();
  }

  generatePostMatchInsight(): AIPostMatchInsight {
    return generatePostMatchInsight(this.profiler.getHistory());
  }

  reset(): void {
    this.profiler.reset();
    this.ensemble.reset();
    this.pendingPrediction = null;
  }
}
