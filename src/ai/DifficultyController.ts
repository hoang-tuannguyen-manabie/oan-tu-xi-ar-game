// Module F — DifficultyController
// Quản lý 3 cấp độ khó: Dễ (Easy), Thường (Normal), Khó (Hard)
// Điều phối mức độ khai thác (Exploitation) và nhiệt độ Softmax (tau)
import { AIDifficulty, DifficultyConfig, ProbabilityDistribution } from './types';

export const DIFFICULTY_CONFIGS: Record<AIDifficulty, DifficultyConfig> = {
  easy: {
    level: 'easy',
    label: 'Dễ',
    description: 'AI chơi ngẫu nhiên nhiều hơn, nhiệt độ cao, ít khai thác quy luật của bạn',
    exploitation: 0.25,
    temperature: 1.00,
    priorAlpha: 1.0,
    learningRate: 0.15,
    initialLambda: 0.10,
    minLambda: 0.05,
    maxLambda: 0.50,
  },
  normal: {
    level: 'normal',
    label: 'Thường',
    description: 'Cân bằng giữa khai thác thói quen và đa dạng ngẫu nhiên',
    exploitation: 0.60,
    temperature: 0.55,
    priorAlpha: 1.0,
    learningRate: 0.25,
    initialLambda: 0.15,
    minLambda: 0.05,
    maxLambda: 0.85,
  },
  hard: {
    level: 'hard',
    label: 'Khó',
    description: 'AI quan sát nhạy bén, khai thác tối đa chuỗi chuyển tiếp và tần suất ra chiêu',
    exploitation: 0.90,
    temperature: 0.25,
    priorAlpha: 1.0,
    learningRate: 0.35,
    initialLambda: 0.20,
    minLambda: 0.05,
    maxLambda: 0.95,
  },
};

export class DifficultyController {
  private currentDifficulty: AIDifficulty;
  private config: DifficultyConfig;

  constructor(initialDifficulty: AIDifficulty = 'normal') {
    this.currentDifficulty = initialDifficulty;
    this.config = { ...DIFFICULTY_CONFIGS[initialDifficulty] };
  }

  setDifficulty(difficulty: AIDifficulty): void {
    if (!DIFFICULTY_CONFIGS[difficulty]) {
      throw new Error(`Độ khó không hợp lệ: ${difficulty}`);
    }
    this.currentDifficulty = difficulty;
    this.config = { ...DIFFICULTY_CONFIGS[difficulty] };
  }

  getDifficulty(): AIDifficulty {
    return this.currentDifficulty;
  }

  getConfig(): Readonly<DifficultyConfig> {
    return this.config;
  }

  /**
   * Pha trộn phân phối Softmax với phân phối đều (Uniform 1/3) dựa trên hệ số exploitation:
   * P_diff(a) = (1 - exploit) * (1/3) + exploit * P_softmax(a)
   */
  blendWithExploitation(softmaxDistribution: ProbabilityDistribution): ProbabilityDistribution {
    const exploit = this.config.exploitation;
    const uniform = 1 / 3;

    const blended: ProbabilityDistribution = {
      rock: (1 - exploit) * uniform + exploit * softmaxDistribution.rock,
      paper: (1 - exploit) * uniform + exploit * softmaxDistribution.paper,
      scissors: (1 - exploit) * uniform + exploit * softmaxDistribution.scissors,
    };

    // Chuẩn hóa
    const sum = blended.rock + blended.paper + blended.scissors;
    return {
      rock: blended.rock / sum,
      paper: blended.paper / sum,
      scissors: blended.scissors / sum,
    };
  }
}
