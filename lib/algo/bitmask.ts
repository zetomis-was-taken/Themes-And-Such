import { ScheduleTime } from "./types";

export type SemesterHalf = "first" | "second" | "full";

export const getCourseSemesterHalf = (courseCode: string): SemesterHalf => {
  const firstHalf = ["BAA00004", "BAA00103", "BAA00101", "BAA00003"];
  const secondHalf = ["BAA00102", "BAA00104"];
  // Handle cases where courseCode might be empty or undefined safely
  if (!courseCode) return "full";
  if (firstHalf.some(code => courseCode.includes(code))) return "first";
  if (secondHalf.some(code => courseCode.includes(code))) return "second";
  return "full";
};

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

export const maskToSchedules = (mask: WeeklyBitmask): ScheduleTime[] => {
  const schedules: ScheduleTime[] = [];
  for (let d = 0; d < 6; d++) {
    const daily = mask[d];
    for (let p = 1; p <= 12; p++) {
      const bitIndex = (p - 1) * 2;
      if ((daily & (1 << bitIndex)) !== 0) {
        schedules.push({ dayOfWeek: d + 2, startPeriod: p, endPeriod: p });
      }
    }
  }
  return schedules;
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

// --- SemesterBitmask utilities ---

export type SemesterBitmask = {
  firstHalf: WeeklyBitmask;
  secondHalf: WeeklyBitmask;
};

export const createEmptySemesterMask = (): SemesterBitmask => ({
  firstHalf: createEmptyMask(),
  secondHalf: createEmptyMask(),
});

export const scheduleToSemesterMask = (
  schedule: ScheduleTime,
  courseCode: string
): SemesterBitmask => {
  const half = getCourseSemesterHalf(courseCode);
  const mask = createEmptySemesterMask();
  const weekly = scheduleToBitmask(schedule);
  if (half === "first" || half === "full") {
    mask.firstHalf = [...weekly] as WeeklyBitmask;
  }
  if (half === "second" || half === "full") {
    mask.secondHalf = [...weekly] as WeeklyBitmask;
  }
  return mask;
};

export const schedulesToSemesterMask = (
  schedules: ScheduleTime[],
  half: SemesterHalf = "full"
): SemesterBitmask => {
  const mask = createEmptySemesterMask();
  const weekly = schedulesToBitmask(schedules);
  if (half === "first" || half === "full") {
    mask.firstHalf = [...weekly] as WeeklyBitmask;
  }
  if (half === "second" || half === "full") {
    mask.secondHalf = [...weekly] as WeeklyBitmask;
  }
  return mask;
};

export const checkSemesterCollision = (
  maskA: SemesterBitmask,
  maskB: SemesterBitmask
): boolean => {
  return (
    checkCollision(maskA.firstHalf, maskB.firstHalf) ||
    checkCollision(maskA.secondHalf, maskB.secondHalf)
  );
};

export const mergeSemesterMasks = (
  maskA: SemesterBitmask,
  maskB: SemesterBitmask
): SemesterBitmask => {
  return {
    firstHalf: mergeMasks(maskA.firstHalf, maskB.firstHalf),
    secondHalf: mergeMasks(maskA.secondHalf, maskB.secondHalf),
  };
};

export const countSemesterBits = (
  mask: SemesterBitmask,
  maskTemplate?: number
): number => {
  let count = 0;
  for (let i = 0; i < 6; i++) {
    // Merge bits from both halves to prevent double counting a full-semester class,
    // and then apply template if provided.
    let combinedDaily = mask.firstHalf[i] | mask.secondHalf[i];
    if (maskTemplate !== undefined) {
      combinedDaily &= maskTemplate;
    }
    count += countBits(combinedDaily);
  }
  return count;
};

export const countSemesterIntersectionBits = (
  maskA: SemesterBitmask,
  maskB: SemesterBitmask
): number => {
  let count = 0;
  for (let i = 0; i < 6; i++) {
    // Compute intersection per half, then union them to prevent double counting
    const intersectFirst = maskA.firstHalf[i] & maskB.firstHalf[i];
    const intersectSecond = maskA.secondHalf[i] & maskB.secondHalf[i];
    count += countBits(intersectFirst | intersectSecond);
  }
  return count;
};
