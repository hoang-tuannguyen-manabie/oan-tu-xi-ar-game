// Module A — OpponentProfiler
// Quản lý dữ liệu trận đấu (10 lượt), chống rò rỉ dữ liệu (Anti-Leakage) và ghi nhận lịch sử bất biến.
import { RPSChoice } from '../data/rps';
import { TurnRecord } from './types';

export class OpponentProfiler {
  private readonly maxTurns: number = 10;
  private records: TurnRecord[] = [];

  constructor(maxTurns: number = 10) {
    this.maxTurns = maxTurns;
  }

  /**
   * Trả về danh sách bất biến các lượt chơi đã hoàn tất.
   * TUYỆT ĐỐI không chứa lượt hiện tại đang chơi.
   */
  getHistory(): readonly TurnRecord[] {
    return this.records;
  }

  /**
   * Lấy chuỗi các nước đi trong quá khứ của người chơi.
   */
  getPlayerChoiceSequence(): RPSChoice[] {
    return this.records.map((r) => r.playerChoice);
  }

  /**
   * Lấy nước đi gần nhất của người chơi. Trả về null nếu đang ở lượt 1.
   */
  getLastPlayerChoice(): RPSChoice | null {
    if (this.records.length === 0) return null;
    return this.records[this.records.length - 1].playerChoice;
  }

  /**
   * Số lượt đã hoàn tất thực tế (0..10).
   */
  getCompletedTurnsCount(): number {
    return this.records.length;
  }

  /**
   * Kiểm tra trận đấu đã hoàn thành 10 lượt chưa.
   * Ngăn chặn học thêm hoặc ghi nhận lượt thứ 11.
   */
  isMatchComplete(): boolean {
    return this.records.length >= this.maxTurns;
  }

  /**
   * Ghi nhận một lượt chơi SAU KHI cả 2 bên đã khóa nước và có kết quả chính thức.
   * Báo lỗi nếu cố tình ghi nhận quá 10 lượt hoặc ghi trùng lặp số lượt.
   */
  recordTurn(record: TurnRecord): void {
    if (this.isMatchComplete()) {
      throw new Error(`Trận đấu đã kết thúc đúng ${this.maxTurns} lượt. Không thể ghi nhận lượt thứ ${record.turnNumber}.`);
    }

    if (this.records.some((r) => r.turnNumber === record.turnNumber)) {
      throw new Error(`Lượt ${record.turnNumber} đã được ghi nhận trước đó. Không được cập nhật trùng lặp.`);
    }

    // Đóng băng bản ghi để đảm bảo tính bất biến
    this.records.push(Object.freeze({ ...record }));
  }

  /**
   * Đếm số lần người chơi đã chọn nước đi cụ thể trong lịch sử đã hoàn tất.
   */
  getPlayerChoiceCount(choice: RPSChoice): number {
    return this.records.filter((r) => r.playerChoice === choice).length;
  }

  /**
   * Làm mới toàn bộ hồ sơ cho trận đấu mới.
   */
  reset(): void {
    this.records = [];
  }
}
