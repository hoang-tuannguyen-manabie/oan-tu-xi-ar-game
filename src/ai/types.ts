// Types và Interface chuẩn cho thuật toán AI Thích Nghi Oẳn Tù Tì 10 Lượt
import { RPSChoice, RPSResult } from '../data/rps';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type ProbabilityDistribution = Record<RPSChoice, number>;

export type ExpectedUtilities = Record<RPSChoice, number>;

export interface ModelWeights {
  lambda: number; // Trọng số của Markov Order 1 trong Ensemble (1 - lambda là của Bayesian Frequency)
  freqWeight: number;
  markovWeight: number;
}

export interface TurnRecord {
  turnNumber: number; // 1 -> 10
  playerChoice: RPSChoice;
  aiChoice: RPSChoice;
  result: RPSResult;
  predictedPlayerProbabilities: ProbabilityDistribution; // Xác suất AI dự đoán người chơi trước khi người chơi chọn
  aiProbabilities: ProbabilityDistribution; // Phân phối xác suất chọn nước của AI
  modelWeights: ModelWeights;
  logLoss: number; // Đánh giá độ chính xác của dự đoán bằng Log Loss
  timestamp: number;
}

export interface DifficultyConfig {
  level: AIDifficulty;
  label: string;
  description: string;
  exploitation: number; // Mức độ khai thác dự đoán (0.25, 0.60, 0.90)
  temperature: number; // Nhiệt độ softmax tau (1.00, 0.55, 0.25)
  priorAlpha: number; // Bayesian smoothing alpha (mặc định 1.0)
  learningRate: number; // Tốc độ cập nhật lambda thích nghi (mặc định 0.25)
  initialLambda: number; // Trọng số Markov ban đầu
  minLambda: number;
  maxLambda: number;
}

export interface TurnPredictionOutcome {
  turnNumber: number;
  predictedPlayerProbabilities: ProbabilityDistribution;
  aiProbabilities: ProbabilityDistribution;
  expectedUtilities: ExpectedUtilities;
  chosenAIChoice: RPSChoice;
  modelWeights: ModelWeights;
  effectiveTemperature: number;
  effectiveExploitation: number;
}

export interface AIPostMatchInsight {
  favoriteMove: RPSChoice;
  favoriteMovePercentage: number;
  patternDetected: string;
  adaptabilityScore: number; // Thang điểm độ khó lường của người chơi (0..100)
  summaryText: string;
}
