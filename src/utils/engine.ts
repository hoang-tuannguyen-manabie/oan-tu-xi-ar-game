// Engine chính cho game AR Oẳn Tù Xì
import {
  evaluateRPS,
  getRandomAIChoice,
  RPSChoice,
  RPSResult,
  RPS_CHOICES,
} from '../data/rps';
import { audio } from './audio';
import {
  detectRPSGesture,
  HAND_CONNECTIONS,
  LandmarkPoint,
} from './gesture';

export type GamePhase =
  | 'CALIBRATING'
  | 'COUNTDOWN'
  | 'SHOWDOWN'
  | 'ROUND_GAP'
  | 'GAMEOVER';

export interface TurnHistoryItem {
  round: 1 | 2;
  turn: number;
  playerChoice: RPSChoice;
  aiChoice: RPSChoice;
  result: RPSResult;
  scoreGain: number;
}

export interface GameState {
  phase: GamePhase;
  round: 1 | 2;
  turn: number; // 1 -> 5 trong mỗi vòng (Tổng cộng 10 lượt: 5 lượt V1 + 5 lượt V2)
  maxTurnsPerRound: number;
  score: number;
  streak: number;
  bestStreak: number;
  round1Wins: number;
  round1Losses: number;
  round1Draws: number;
  round2Wins: number;
  round2Losses: number;
  round2Draws: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  countdownSeconds: number; // 3.0s đếm ngược Oẳn - Tù - Xì
  chantWord: 'OẲN' | 'TÙ' | 'XÌ' | '';
  gapCountdown: number; // 5s gap giữa vòng 1 và vòng 2
  playerChoice: RPSChoice | null;
  aiChoice: RPSChoice | null;
  lastResult: RPSResult | null;
  resultMessage: string;
  resultDetail: string;
  isGameOver: boolean;
  isWin: boolean;
  handsVisible: number;
  screenShake: number;
  history: TurnHistoryItem[];
}

export class GameEngine {
  private width = 960;
  private height = 540;
  private onStateChange: (state: GameState) => void;

  private state: GameState = {
    phase: 'CALIBRATING',
    round: 1,
    turn: 1,
    maxTurnsPerRound: 5,
    score: 0,
    streak: 0,
    bestStreak: 0,
    round1Wins: 0,
    round1Losses: 0,
    round1Draws: 0,
    round2Wins: 0,
    round2Losses: 0,
    round2Draws: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    countdownSeconds: 3.0,
    chantWord: '',
    gapCountdown: 5,
    playerChoice: null,
    aiChoice: null,
    lastResult: null,
    resultMessage: '',
    resultDetail: '',
    isGameOver: false,
    isWin: false,
    handsVisible: 0,
    screenShake: 0,
    history: [],
  };

  private currentLandmarks: LandmarkPoint[] | null = null;
  private liveGesture: RPSChoice | null = null;
  private liveGestureLabel: string = 'Đang nhận diện...';
  private phaseTimer: number = 0;
  private lastChantPlayed: string = '';
  private shockwaves: Array<{ x: number; y: number; r: number; color: string; life: number; age: number }> = [];
  private particles: Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }> = [];

  constructor(onStateChange: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.startCountdown();
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  // Cập nhật tọa độ bàn tay từ MediaPipe
  updateHand(landmarks: LandmarkPoint[] | null) {
    this.currentLandmarks = landmarks;
    this.state.handsVisible = landmarks && landmarks.length >= 21 ? 1 : 0;

    if (landmarks && landmarks.length >= 21) {
      const detected = detectRPSGesture(landmarks);
      this.liveGesture = detected.choice;
      this.liveGestureLabel = detected.label;
    } else {
      this.liveGesture = null;
      this.liveGestureLabel = 'Chưa phát hiện bàn tay';
    }
  }

  // Chế độ chơi chuột / dự phòng
  setMouseChoice(choice: RPSChoice) {
    this.liveGesture = choice;
    this.liveGestureLabel = RPS_CHOICES[choice].vietnameseName;
  }

  // Bắt đầu đếm ngược 3s "Oẳn - Tù - Xì"
  private startCountdown() {
    this.state.phase = 'COUNTDOWN';
    this.state.countdownSeconds = 3.0;
    this.state.chantWord = 'OẲN';
    this.state.playerChoice = null;
    this.state.aiChoice = null;
    this.state.lastResult = null;
    this.state.resultMessage = '';
    this.state.resultDetail = '';
    this.phaseTimer = 0;
    this.lastChantPlayed = '';
    this.onStateChange({ ...this.state });
  }

  update(dtMs: number) {
    const dt = dtMs / 1000;

    // Giảm độ rung lắc màn hình dần dần
    if (this.state.screenShake > 0) {
      this.state.screenShake = Math.max(0, this.state.screenShake - dt * 25);
    }

    // Cập nhật hiệu ứng hạt & sóng xung kích
    this.updateVFX(dt);

    if (this.state.phase === 'COUNTDOWN') {
      this.state.countdownSeconds -= dt;

      // Xử lý đếm nhịp "OẲN - TÙ - XÌ" kèm hiệu ứng giật rung 3s
      if (this.state.countdownSeconds > 2.0) {
        this.state.chantWord = 'OẲN';
        this.state.screenShake = Math.max(this.state.screenShake, 3.5);
        if (this.lastChantPlayed !== 'oan') {
          this.lastChantPlayed = 'oan';
          audio.playChant('oan');
        }
      } else if (this.state.countdownSeconds > 1.0) {
        this.state.chantWord = 'TÙ';
        this.state.screenShake = Math.max(this.state.screenShake, 7.5);
        if (this.lastChantPlayed !== 'tu') {
          this.lastChantPlayed = 'tu';
          audio.playChant('tu');
        }
      } else if (this.state.countdownSeconds > 0) {
        this.state.chantWord = 'XÌ';
        this.state.screenShake = Math.max(this.state.screenShake, 14);
        if (this.lastChantPlayed !== 'xi') {
          this.lastChantPlayed = 'xi';
          audio.playChant('xi');
        }
      } else {
        // HẾT PHẦN ĐẾM NGƯỢC -> GHI NHẬN TƯ THẾ TAY SAU CÙNG CỦA NGƯỜI CHƠI
        this.resolveShowdown();
        return;
      }

      this.onStateChange({ ...this.state });
    } else if (this.state.phase === 'SHOWDOWN') {
      this.phaseTimer += dt;
      // Dừng lại 2.2 giây để người chơi thấy rõ kết quả trước khi sang lượt tiếp theo
      if (this.phaseTimer >= 2.2) {
        this.advanceTurn();
      }
    } else if (this.state.phase === 'ROUND_GAP') {
      this.state.gapCountdown -= dt;
      if (this.state.gapCountdown <= 0) {
        // Hết 5s nghỉ giữa 2 vòng -> Bắt đầu Vòng 2!
        this.state.round = 2;
        this.state.turn = 1;
        this.startCountdown();
      } else {
        this.onStateChange({ ...this.state });
      }
    }
  }

  // Ghi nhận tư thế sau cùng và so tài với AI
  private resolveShowdown() {
    this.state.phase = 'SHOWDOWN';
    this.state.countdownSeconds = 0;
    this.phaseTimer = 0;
    this.state.screenShake = 18; // Giật nổ màn hình lúc chạm trán

    // Tư thế tay sau cùng của người chơi
    let player = this.liveGesture;
    if (!player) {
      // Nếu không bắt được tay lúc hết đếm ngược -> mặc định ra ngẫu nhiên hoặc búa
      player = 'rock';
    }

    // Máy random ngẫu nhiên 1 trong 3 dạng
    const ai = getRandomAIChoice();
    const evaluation = evaluateRPS(player, ai);

    this.state.playerChoice = player;
    this.state.aiChoice = ai;
    this.state.lastResult = evaluation.result;
    this.state.resultMessage = evaluation.message;
    this.state.resultDetail = evaluation.detail;

    let scoreGain = 0;
    if (evaluation.result === 'win') {
      scoreGain = 100 + this.state.streak * 20;
      this.state.score += scoreGain;
      this.state.streak += 1;
      this.state.bestStreak = Math.max(this.state.bestStreak, this.state.streak);
      if (this.state.round === 1) this.state.round1Wins += 1;
      else this.state.round2Wins += 1;
      this.state.totalWins += 1;
      audio.playWin();
      this.spawnConfetti();
    } else if (evaluation.result === 'draw') {
      scoreGain = 30;
      this.state.score += scoreGain;
      if (this.state.round === 1) this.state.round1Draws += 1;
      else this.state.round2Draws += 1;
      this.state.totalDraws += 1;
      audio.playDraw();
    } else {
      scoreGain = 0;
      this.state.streak = 0;
      if (this.state.round === 1) this.state.round1Losses += 1;
      else this.state.round2Losses += 1;
      this.state.totalLosses += 1;
      audio.playLose();
    }

    audio.playClash();
    this.spawnShockwave(this.width / 2, this.height / 2, evaluation.result === 'win' ? '#10B981' : evaluation.result === 'lose' ? '#EF4444' : '#F59E0B');

    // Lưu vào lịch sử đấu
    this.state.history.push({
      round: this.state.round,
      turn: this.state.turn,
      playerChoice: player,
      aiChoice: ai,
      result: evaluation.result,
      scoreGain,
    });

    this.onStateChange({ ...this.state });
  }

  // Chuyển lượt hoặc chuyển vòng đấu
  private advanceTurn() {
    if (this.state.turn < this.state.maxTurnsPerRound) {
      // Tiếp tục lượt tiếp theo trong cùng vòng
      this.state.turn += 1;
      this.startCountdown();
    } else {
      // Đã xong 5 lượt của vòng hiện tại
      if (this.state.round === 1) {
        // Hết Vòng 1 -> Vào khoảng gap 5s chuẩn bị Vòng 2 (Người chơi 2)
        this.state.phase = 'ROUND_GAP';
        this.state.gapCountdown = 5.0;
        this.state.chantWord = '';
        this.onStateChange({ ...this.state });
      } else {
        // Hết cả 2 vòng (10 lượt) -> Kết thúc game!
        this.state.phase = 'GAMEOVER';
        this.state.isGameOver = true;
        this.state.isWin = this.state.totalWins > this.state.totalLosses;
        this.onStateChange({ ...this.state });
      }
    }
  }

  private updateVFX(dt: number) {
    // Sóng xung kích
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.age += dt;
      sw.r += dt * 380;
      if (sw.age >= sw.life) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Hạt pháo hoa
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += dt * 250; // Trọng lực
      p.alpha -= dt * 0.9;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnShockwave(x: number, y: number, color: string) {
    this.shockwaves.push({ x, y, r: 20, color, life: 0.6, age: 0 });
  }

  private spawnConfetti() {
    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 280 + 120;
      this.particles.push({
        x: this.width / 2,
        y: this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        alpha: 1,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // CANVAS RENDERING
  // ---------------------------------------------------------------------------
  draw(ctx: CanvasRenderingContext2D) {
    const { width: w, height: h } = this;

    ctx.save();
    // Hiệu ứng rung giật màn hình trong lúc đếm ngược 3s Oẳn Tù Xì
    if (this.state.screenShake > 0.1) {
      const shakeX = (Math.random() - 0.5) * this.state.screenShake * 2;
      const shakeY = (Math.random() - 0.5) * this.state.screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Vẽ nền đấu trường Cyber
    this.drawBackground(ctx, w, h);

    // 2. Vẽ AR Skeleton trên bàn tay người chơi
    if (this.currentLandmarks && this.currentLandmarks.length >= 21) {
      this.drawHandSkeleton(ctx, this.currentLandmarks);
    }

    // 3. Vẽ sóng xung kích & hạt
    this.drawVFX(ctx);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h));
    grad.addColorStop(0, '#091330');
    grad.addColorStop(1, '#030714');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Vạch chia đôi võ đài Player vs AI
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Vẽ khung xương Skeleton AR 21 khớp
  private drawHandSkeleton(ctx: CanvasRenderingContext2D, lm: LandmarkPoint[]) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const gesture = this.liveGesture;
    const themeColor =
      gesture === 'rock' ? '#F59E0B' : gesture === 'scissors' ? '#EF4444' : gesture === 'paper' ? '#10B981' : '#38BDF8';

    // 1. Vẽ các đường xương
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 14;

    for (const [fromIdx, toIdx] of HAND_CONNECTIONS) {
      const p1 = lm[fromIdx];
      const p2 = lm[toIdx];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Vẽ 21 khớp tròn
    ctx.shadowBlur = 0;
    for (let i = 0; i < lm.length; i++) {
      const pt = lm[i];
      const isTip = [4, 8, 12, 16, 20].includes(i);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isTip ? 6.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isTip ? '#FFFFFF' : themeColor;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 3. Huy hiệu tên chiêu thức nổi trên cổ tay
    const wrist = lm[0];
    ctx.fillStyle = 'rgba(5, 12, 34, 0.88)';
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(wrist.x - 65, wrist.y + 15, 130, 32, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText(this.liveGestureLabel, wrist.x, wrist.y + 31);

    ctx.restore();
  }

  private drawVFX(ctx: CanvasRenderingContext2D) {
    // Sóng xung kích
    for (const sw of this.shockwaves) {
      const progress = sw.age / sw.life;
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4 * (1 - progress);
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Hạt pháo hoa
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  getState(): GameState {
    return { ...this.state };
  }
}
