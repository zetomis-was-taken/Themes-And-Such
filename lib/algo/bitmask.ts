import { ScheduleTime } from "./types";

export type WeeklyBitmask = [number, number, number, number, number, number];

export const createEmptyMask = (): WeeklyBitmask => [0, 0, 0, 0, 0, 0];

export const periodToBitIndex = (period: number): number => {
  return (period - 1) * 2;
};

export const createDailyMask = (
  startPeriod: number,
  endPeriod: number,
): number => {
  const startIndex = periodToBitIndex(startPeriod);
  const endIndex = periodToBitIndex(endPeriod);

  let mask = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    mask |= 1 << i;
  }
  return mask;
};

export const scheduleToBitmask = (schedule: ScheduleTime): WeeklyBitmask => {
  const mask = createEmptyMask();
  const dayIndex = schedule.dayOfWeek - 2;

  if (dayIndex >= 0 && dayIndex < 6) {
    mask[dayIndex] = createDailyMask(schedule.startPeriod, schedule.endPeriod);
  }

  return mask;
};

export const schedulesToBitmask = (
  schedules: ScheduleTime[],
): WeeklyBitmask => {
  const mask = createEmptyMask();
  for (const schedule of schedules) {
    const dayIndex = schedule.dayOfWeek - 2;
    if (dayIndex >= 0 && dayIndex < 6) {
      mask[dayIndex] |= createDailyMask(
        schedule.startPeriod,
        schedule.endPeriod,
      );
    }
  }
  return mask;
};

export const checkCollision = (
  maskA: WeeklyBitmask,
  maskB: WeeklyBitmask,
): boolean => {
  for (let i = 0; i < 6; i++) {
    if ((maskA[i] & maskB[i]) !== 0) {
      return true;
    }
  }
  return false;
};

export const mergeMasks = (
  maskA: WeeklyBitmask,
  maskB: WeeklyBitmask,
): WeeklyBitmask => {
  return [
    maskA[0] | maskB[0],
    maskA[1] | maskB[1],
    maskA[2] | maskB[2],
    maskA[3] | maskB[3],
    maskA[4] | maskB[4],
    maskA[5] | maskB[5],
  ];
};

export const countBits = (n: number): number => {
  let count = 0;
  let temp = n;
  while (temp > 0) {
    count += temp & 1;
    temp >>= 1;
  }
  return count;
};
