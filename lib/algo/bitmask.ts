import { ScheduleTime } from './types';

/**
 * Mỗi ngày có tiết học từ 1 đến 10, bước nhảy là 0.5.
 * Do đó có tổng cộng 19 giá trị tiết học: 1, 1.5, 2, 2.5, ..., 10.
 *
 * Ta dùng 1 số nguyên cho mỗi ngày (từ thứ 2 đến thứ 7 -> 6 số nguyên).
 * Mỗi số nguyên sử dụng 19 bits để biểu diễn lịch học trong ngày đó.
 *
 * index ngày: dayOfWeek - 2 (Thứ 2 -> index 0, Thứ 7 -> index 5)
 */

export type WeeklyBitmask = [number, number, number, number, number, number];

export const createEmptyMask = (): WeeklyBitmask => [0, 0, 0, 0, 0, 0];

/**
 * Chuyển đổi period thành bit index.
 * Vd:
 * Tiết 1 -> index 0
 * Tiết 1.5 -> index 1
 * Tiết 2 -> index 2
 * ...
 * Tiết 10 -> index 18
 */
export const periodToBitIndex = (period: number): number => {
  return (period - 1) * 2;
};

/**
 * Tạo một số nguyên (bitmask) biểu diễn khoảng thời gian từ startPeriod đến endPeriod
 */
export const createDailyMask = (startPeriod: number, endPeriod: number): number => {
  const startIndex = periodToBitIndex(startPeriod);
  const endIndex = periodToBitIndex(endPeriod); // Inclusive endPeriod

  let mask = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    mask |= (1 << i);
  }
  return mask;
};

/**
 * Chuyển đổi ScheduleTime thành WeeklyBitmask
 */
export const scheduleToBitmask = (schedule: ScheduleTime): WeeklyBitmask => {
  const mask = createEmptyMask();
  const dayIndex = schedule.dayOfWeek - 2;

  if (dayIndex >= 0 && dayIndex < 6) {
    mask[dayIndex] = createDailyMask(schedule.startPeriod, schedule.endPeriod);
  }

  return mask;
};

/**
 * Trộn nhiều ScheduleTime thành 1 WeeklyBitmask (hữu ích cho constraints)
 */
export const schedulesToBitmask = (schedules: ScheduleTime[]): WeeklyBitmask => {
  const mask = createEmptyMask();
  for (const schedule of schedules) {
    const dayIndex = schedule.dayOfWeek - 2;
    if (dayIndex >= 0 && dayIndex < 6) {
      mask[dayIndex] |= createDailyMask(schedule.startPeriod, schedule.endPeriod);
    }
  }
  return mask;
};

/**
 * Kiểm tra xem 2 WeeklyBitmask có trùng nhau không.
 * Trả về true nếu có trùng lặp.
 */
export const checkCollision = (maskA: WeeklyBitmask, maskB: WeeklyBitmask): boolean => {
  for (let i = 0; i < 6; i++) {
    if ((maskA[i] & maskB[i]) !== 0) {
      return true; // Có trùng lịch
    }
  }
  return false;
};

/**
 * Gộp 2 WeeklyBitmask lại với nhau
 */
export const mergeMasks = (maskA: WeeklyBitmask, maskB: WeeklyBitmask): WeeklyBitmask => {
  return [
    maskA[0] | maskB[0],
    maskA[1] | maskB[1],
    maskA[2] | maskB[2],
    maskA[3] | maskB[3],
    maskA[4] | maskB[4],
    maskA[5] | maskB[5],
  ];
};

/**
 * Tính số bit 1 trong một số nguyên (dùng để đếm số tiết học khớp)
 */
export const countBits = (n: number): number => {
  let count = 0;
  let temp = n;
  while (temp > 0) {
    count += temp & 1;
    temp >>= 1;
  }
  return count;
};
