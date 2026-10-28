// Test suite và Simulation cho thuật toán AI Thích Nghi Oẳn Tù Tì
import { AdaptiveRPSAI } from '../src/ai/AdaptiveRPSAI';
import { BayesianFrequencyModel } from '../src/ai/BayesianFrequencyModel';
import { MarkovOrder1Model } from '../src/ai/MarkovOrder1Model';
import { OpponentProfiler } from '../src/ai/OpponentProfiler';
import { StrategySelector } from '../src/ai/StrategySelector';
import { evaluateRPS, RPSChoice, ALL_RPS_CHOICES } from '../src/data/rps';
import { AIDifficulty, ProbabilityDistribution, TurnRecord } from '../src/ai/types';

// =============================================================================
// PHẦN 1: UNIT TESTS BẮT BUỘC
// =============================================================================

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[FAIL] ${message}`);
  }
}

function assertClose(a: number, b: number, eps: number = 1e-4, message?: string) {
  if (Math.abs(a - b) > eps) {
    throw new Error(`[FAIL] ${message || ''}: ${a} != ${b} (diff: ${Math.abs(a - b)} > ${eps})`);
  }
}

function runUnitTests() {
  console.log('\n--- 1. CHẠY UNIT TESTS BẮT BUỘC ---');

  // Test 1: Chưa có lịch sử -> xác suất ban đầu là 1/3 cho mỗi nước
  {
    const freq = new BayesianFrequencyModel(1.0);
    const p0 = freq.predict([]);
    assertClose(p0.rock, 1 / 3, 1e-6, 'P_freq khi chưa có lịch sử');
    assertClose(p0.paper, 1 / 3, 1e-6, 'P_freq khi chưa có lịch sử');
    assertClose(p0.scissors, 1 / 3, 1e-6, 'P_freq khi chưa có lịch sử');

    const markov = new MarkovOrder1Model(1.0);
    const m0 = markov.predict([]);
    assertClose(m0.distribution.rock, 1 / 3, 1e-6, 'P_M1 khi chưa có lịch sử');

    const ai = new AdaptiveRPSAI({ difficulty: 'normal' });
    const turn1 = ai.prepareTurn(1);
    assertClose(turn1.predictedPlayerProbabilities.rock, 1 / 3, 1e-4, 'AI dự đoán lượt 1');
    assertClose(turn1.predictedPlayerProbabilities.paper, 1 / 3, 1e-4, 'AI dự đoán lượt 1');
    assertClose(turn1.predictedPlayerProbabilities.scissors, 1 / 3, 1e-4, 'AI dự đoán lượt 1');
    console.log('✓ Test 1: Chưa có lịch sử -> xác suất ban đầu đồng đều 1/3.');
  }

  // Test 2: Tần suất có mẫu nhỏ vẫn được làm mượt (Bayesian smoothing)
  {
    const freq = new BayesianFrequencyModel(1.0);
    // 1 lượt duy nhất người chơi ra Rock: N_rock = 1, n = 1, alpha = 1
    // P(R) = (1 + 1)/(1 + 3) = 2/4 = 0.5. P(P) = (0 + 1)/(1 + 3) = 0.25
    const p1 = freq.predict(['rock']);
    assertClose(p1.rock, 0.5, 1e-6, 'Bayesian smoothing mẫu nhỏ (1 lần Rock)');
    assertClose(p1.paper, 0.25, 1e-6, 'Bayesian smoothing mẫu nhỏ Paper');
    assertClose(p1.scissors, 0.25, 1e-6, 'Bayesian smoothing mẫu nhỏ Scissors');
    assert(p1.rock < 1.0, 'Xác suất không bị cực đoan 100%');
    console.log('✓ Test 2: Mẫu nhỏ được làm mượt Bayesian (P(Rock) = 0.5 sau 1 lượt).');
  }

  // Test 3: Markov không có chuyển tiếp không gây lỗi
  {
    const markov = new MarkovOrder1Model(1.0);
    // Chỉ có 1 nước đi -> chưa có cặp chuyển tiếp
    const res = markov.predict(['rock']);
    assert(res.totalTransitions === 0, 'Chưa có chuyển tiếp');
    assertClose(res.distribution.rock, 1 / 3, 1e-6, 'Markov fallback 1/3');
    assertClose(res.distribution.paper, 1 / 3, 1e-6, 'Markov fallback 1/3');
    assertClose(res.distribution.scissors, 1 / 3, 1e-6, 'Markov fallback 1/3');
    console.log('✓ Test 3: Markov không có chuyển tiếp hoạt động an toàn không lỗi.');
  }

  // Test 4: Tổng xác suất của mỗi phân phối luôn bằng 1.0
  {
    const ai = new AdaptiveRPSAI({ difficulty: 'hard' });
    const t1 = ai.prepareTurn(1);
    const sumP =
      t1.predictedPlayerProbabilities.rock +
      t1.predictedPlayerProbabilities.paper +
      t1.predictedPlayerProbabilities.scissors;
    assertClose(sumP, 1.0, 1e-6, 'Tổng xác suất dự đoán lượt 1');

    const sumAI = t1.aiProbabilities.rock + t1.aiProbabilities.paper + t1.aiProbabilities.scissors;
    assertClose(sumAI, 1.0, 1e-6, 'Tổng xác suất nước đi AI');
    console.log('✓ Test 4: Tổng xác suất luôn bằng 1.0 trong sai số số thực.');
  }

  // Test 5: Softmax hoạt động ổn định với nhiệt độ cực thấp (tránh overflow / division by zero)
  {
    const selector = new StrategySelector();
    const extremeUtilities = { rock: 10.0, paper: -10.0, scissors: 0.0 };
    const pLowTau = selector.computeSoftmaxProbabilities(extremeUtilities, 0.01);
    assert(isFinite(pLowTau.rock) && !isNaN(pLowTau.rock), 'Số thực hữu hạn');
    assert(pLowTau.rock > 0.99, 'Nước có utility cao nhất chiếm ưu thế tuyệt đối');
    assertClose(pLowTau.rock + pLowTau.paper + pLowTau.scissors, 1.0, 1e-6, 'Tổng softmax = 1');
    console.log('✓ Test 5: Softmax ổn định số học với nhiệt độ cực thấp.');
  }

  // Test 6: Bộ lấy mẫu chỉ trả về Rock, Paper hoặc Scissors
  {
    const selector = new StrategySelector();
    const dist: ProbabilityDistribution = { rock: 0.2, paper: 0.5, scissors: 0.3 };
    for (let i = 0; i < 100; i++) {
      const choice = selector.sampleChoice(dist);
      assert(ALL_RPS_CHOICES.includes(choice), 'Lựa chọn hợp lệ');
    }
    console.log('✓ Test 6: Bộ lấy mẫu trả về đúng 3 dạng Rock, Paper, Scissors.');
  }

  // Test 7: Kết quả thắng, thua, hòa chính xác tuyệt đối
  {
    assert(evaluateRPS('rock', 'scissors').result === 'win', 'Búa đập Kéo');
    assert(evaluateRPS('paper', 'rock').result === 'win', 'Bao bọc Búa');
    assert(evaluateRPS('scissors', 'paper').result === 'win', 'Kéo cắt Bao');
    assert(evaluateRPS('rock', 'rock').result === 'draw', 'Búa hòa Búa');
    assert(evaluateRPS('paper', 'scissors').result === 'lose', 'Bao thua Kéo');
    console.log('✓ Test 7: Ma trận thắng, thua, hòa chính xác.');
  }

  // Test 8: Lựa chọn hiện tại KHÔNG bị rò rỉ vào dự đoán hiện tại (Anti-Leakage)
  {
    const ai = new AdaptiveRPSAI();
    // Chuẩn bị lượt 1: AI đưa ra dự đoán và chốt nước
    const t1 = ai.prepareTurn(1);
    const aiPreChoice = t1.chosenAIChoice;
    // Người chơi chọn 'scissors'
    const evalResult = evaluateRPS('scissors', aiPreChoice);
    ai.recordTurnResult(1, 'scissors', evalResult.result);

    // Kiểm tra dự đoán lượt 1 KHÔNG chứa thông tin 'scissors' vừa chọn
    const history = ai.getHistory();
    assert(history.length === 1, 'Đã lưu 1 bản ghi');
    assertClose(history[0].predictedPlayerProbabilities.scissors, 1 / 3, 1e-6, 'Dự đoán lượt 1 giữ nguyên 1/3');
    console.log('✓ Test 8: Không rò rỉ dữ liệu lượt hiện tại vào dự đoán của chính nó.');
  }

  // Test 9: Không xử lý trùng một lượt hoặc cập nhật mô hình hai lần
  {
    const ai = new AdaptiveRPSAI();
    ai.prepareTurn(1);
    ai.recordTurnResult(1, 'rock', 'draw');
    let duplicateErrorThrown = false;
    try {
      // Cố tình ghi đè lượt 1 lần thứ 2
      ai.recordTurnResult(1, 'paper', 'lose');
    } catch {
      duplicateErrorThrown = true;
    }
    assert(duplicateErrorThrown, 'Phải báo lỗi khi ghi trùng lượt');
    console.log('✓ Test 9: Chống cập nhật trùng lặp bản ghi.');
  }

  // Test 10: Trận đấu dừng đúng sau 10 lượt, không chơi thêm lượt thứ 11
  {
    const ai = new AdaptiveRPSAI({ maxTurns: 10 });
    for (let turn = 1; turn <= 10; turn++) {
      const pred = ai.prepareTurn(turn);
      const evalRes = evaluateRPS('rock', pred.chosenAIChoice);
      ai.recordTurnResult(turn, 'rock', evalRes.result);
    }
    assert(ai.isMatchComplete(), 'Trận đấu hoàn thành đúng 10 lượt');
    assert(ai.getHistory().length === 10, 'Đúng 10 bản ghi');

    let eleventhTurnBlocked = false;
    try {
      ai.prepareTurn(11);
    } catch {
      eleventhTurnBlocked = true;
    }
    assert(eleventhTurnBlocked, 'Chặn không cho chơi lượt 11');
    console.log('✓ Test 10: Trận đấu dừng chính xác sau lượt 10; chặn hoàn toàn lượt 11.');
  }

  console.log('\n--- TẤT CẢ 10/10 UNIT TESTS ĐÃ ĐẠT CHUẨN! ---');
}

// =============================================================================
// PHẦN 2: MÔ PHỎNG ĐỐI KHÁNG VỚI 7 BOT ARCHETYPES
// =============================================================================

type BotStrategy = (
  turn: number,
  history: readonly TurnRecord[],
  prevChoice: RPSChoice | null,
  prevResult: 'win' | 'lose' | 'draw' | null
) => RPSChoice;

const BOTS: Record<string, BotStrategy> = {
  // 1. Chọn ngẫu nhiên đều
  '1. Uniform Random': () => {
    return ALL_RPS_CHOICES[Math.floor(Math.random() * 3)];
  },

  // 2. Luôn chọn Búa
  '2. Always Rock': () => {
    return 'rock';
  },

  // 3. Lặp lại nước vừa thắng (Win-Stay, Lose-Shift ngẫu nhiên)
  '3. Win-Stay, Lose-Shift': (_turn, _hist, prevChoice, prevResult) => {
    if (prevChoice && prevResult === 'win') {
      return prevChoice;
    }
    // Đổi sang nước khác nếu thua hoặc hòa
    const others = ALL_RPS_CHOICES.filter((c) => c !== prevChoice);
    return others[Math.floor(Math.random() * others.length)];
  },

  // 4. Đổi nước sau khi thua
  '4. Switch After Lose': (_turn, _hist, prevChoice, prevResult) => {
    if (prevChoice && prevResult === 'lose') {
      const nextMap: Record<RPSChoice, RPSChoice> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
      return nextMap[prevChoice];
    }
    return prevChoice || 'rock';
  },

  // 5. Chọn theo chu kỳ Búa -> Bao -> Kéo
  '5. Cycle (R -> P -> S)': (turn) => {
    const cycle: RPSChoice[] = ['rock', 'paper', 'scissors'];
    return cycle[(turn - 1) % 3];
  },

  // 6. Chuyển chiến thuật giữa trận (Vòng 1 luôn Rock, Vòng 2 Cycle)
  '6. Mid-Game Switcher': (turn) => {
    if (turn <= 5) return 'rock';
    const cycle: RPSChoice[] = ['scissors', 'paper', 'rock'];
    return cycle[(turn - 6) % 3];
  },

  // 7. Gần ngẫu nhiên nhưng thiên lệch (60% Rock, 20% Paper, 20% Scissors)
  '7. Biased Random (60% R)': () => {
    const r = Math.random();
    if (r < 0.6) return 'rock';
    if (r < 0.8) return 'paper';
    return 'scissors';
  },
};

interface SimulationResult {
  botName: string;
  difficulty: AIDifficulty;
  totalMatches: number;
  aiWinRate: number;
  drawRate: number;
  playerWinRate: number;
  avgLogLoss: number;
  calibrationError: number;
}

function simulateMatch(botStrategy: BotStrategy, difficulty: AIDifficulty) {
  const ai = new AdaptiveRPSAI({ difficulty, maxTurns: 10 });
  let prevPlayerChoice: RPSChoice | null = null;
  let prevPlayerResult: 'win' | 'lose' | 'draw' | null = null;

  for (let turn = 1; turn <= 10; turn++) {
    // 1. AI chuẩn bị và chốt nước
    const prediction = ai.prepareTurn(turn);
    const aiChoice = prediction.chosenAIChoice;

    // 2. Bot đưa ra nước đi
    const playerChoice = botStrategy(turn, ai.getHistory(), prevPlayerChoice, prevPlayerResult);

    // 3. Đánh giá kết quả (theo góc nhìn người chơi)
    const playerEval = evaluateRPS(playerChoice, aiChoice);

    // 4. AI ghi nhận kết quả và học
    ai.recordTurnResult(turn, playerChoice, playerEval.result);

    prevPlayerChoice = playerChoice;
    prevPlayerResult = playerEval.result;
  }

  return ai.getHistory();
}

function runSimulations() {
  console.log('\n--- 2. MÔ PHỎNG ĐỐI KHÁNG 7 BOT ARCHETYPES (100 TRẬN 10 LƯỢT MỖI BOT) ---');
  const MATCHES_PER_BOT = 100;
  const difficulties: AIDifficulty[] = ['easy', 'normal', 'hard'];

  const results: SimulationResult[] = [];

  for (const [botName, botStrategy] of Object.entries(BOTS)) {
    for (const diff of difficulties) {
      let aiWins = 0;
      let draws = 0;
      let playerWins = 0;
      let totalLogLoss = 0;
      let totalTurns = 0;

      // Calibration tracking: phân nhóm xác suất dự đoán [0..1] với tần suất thực tế
      const bins = [0, 0, 0]; // R, P, S predicted sum
      const actualCounts = [0, 0, 0];

      for (let m = 0; m < MATCHES_PER_BOT; m++) {
        const history = simulateMatch(botStrategy, diff);
        for (const record of history) {
          totalTurns++;
          totalLogLoss += record.logLoss;

          // AI thắng khi người chơi thua
          if (record.result === 'lose') {
            aiWins++;
          } else if (record.result === 'draw') {
            draws++;
          } else {
            playerWins++;
          }

          bins[0] += record.predictedPlayerProbabilities.rock;
          bins[1] += record.predictedPlayerProbabilities.paper;
          bins[2] += record.predictedPlayerProbabilities.scissors;

          if (record.playerChoice === 'rock') actualCounts[0]++;
          else if (record.playerChoice === 'paper') actualCounts[1]++;
          else actualCounts[2]++;
        }
      }

      // Calibration error: chênh lệch giữa xác suất dự đoán trung bình và tần suất thực tế
      let calError = 0;
      for (let c = 0; c < 3; c++) {
        const pPred = bins[c] / totalTurns;
        const pAct = actualCounts[c] / totalTurns;
        calError += Math.abs(pPred - pAct);
      }
      calError /= 3;

      const aiWinRate = Math.round((aiWins / totalTurns) * 100);
      const drawRate = Math.round((draws / totalTurns) * 100);
      const playerWinRate = Math.round((playerWins / totalTurns) * 100);
      const avgLogLoss = Number((totalLogLoss / totalTurns).toFixed(3));

      results.push({
        botName,
        difficulty: diff,
        totalMatches: MATCHES_PER_BOT,
        aiWinRate,
        drawRate,
        playerWinRate,
        avgLogLoss,
        calibrationError: Number(calError.toFixed(3)),
      });
    }
  }

  // In bảng kết quả mô phỏng
  console.log('\nBẢNG KẾT QUẢ ĐỐI KHÁNG (100 TRẬN x 10 LƯỢT = 1000 LƯỢT / HÀNG):');
  console.log(
    '---------------------------------------------------------------------------------------------------------'
  );
  console.log(
    'Bot Archetype                  | Độ Khó | AI Thắng (%) | Hòa (%) | Người Thắng (%) | Log Loss | Calibration'
  );
  console.log(
    '---------------------------------------------------------------------------------------------------------'
  );

  for (const r of results) {
    const name = r.botName.padEnd(30, ' ');
    const diff = r.difficulty.toUpperCase().padEnd(6, ' ');
    const win = `${r.aiWinRate}%`.padStart(12, ' ');
    const draw = `${r.drawRate}%`.padStart(7, ' ');
    const pWin = `${r.playerWinRate}%`.padStart(15, ' ');
    const loss = r.avgLogLoss.toFixed(3).padStart(8, ' ');
    const cal = r.calibrationError.toFixed(3).padStart(11, ' ');
    console.log(`${name} | ${diff} | ${win} | ${draw} | ${pWin} | ${loss} | ${cal}`);
  }
  console.log(
    '---------------------------------------------------------------------------------------------------------'
  );
}

// Chạy toàn bộ
try {
  runUnitTests();
  runSimulations();
  console.log('\n[SUCCESS] HOÀN TẤT KIỂM THỬ THÀNH CÔNG RỰC RỠ!');
} catch (err) {
  console.error('\n[ERROR THROW]', err);
  process.exit(1);
}
