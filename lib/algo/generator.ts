import {
  ClassData,
  CourseRequest,
  GeneratedSchedule,
  GeneratorParams,
  SelectedClass,
  SubClassData,
  TimeConstraints,
} from "./types";
import {
  checkCollision,
  createEmptyMask,
  mergeMasks,
  schedulesToBitmask,
  scheduleToBitmask,
  WeeklyBitmask,
  countBits,
} from "./bitmask";

export class ScheduleGenerator {
  private params: GeneratorParams;
  private forbiddenMask: WeeklyBitmask;
  private preferredMask: WeeklyBitmask;
  private validClassesByCourseCode: Map<string, ClassData[]>;
  private results: GeneratedSchedule[];
  private maxResults: number;

  constructor(params: GeneratorParams) {
    this.params = params;
    this.results = [];
    this.forbiddenMask = schedulesToBitmask(
      params.constraints.forbiddenTimes || [],
    );
    this.preferredMask = schedulesToBitmask(
      params.constraints.preferredTimes || [],
    );
    this.validClassesByCourseCode = new Map();
    this.maxResults = params.maxResults || 1000;
  }

  public generate(): GeneratedSchedule[] {
    this.preProcessClasses();

    this.backtrack([], createEmptyMask(), 0, new Array(6).fill(0));

    return this.results;
  }

  private preProcessClasses() {
    for (const classData of this.params.availableClasses) {
      const classMask = scheduleToBitmask(classData.schedule);

      if (checkCollision(classMask, this.forbiddenMask)) continue;

      let hasCollisionInSubClasses = false;

      if (classData.subClasses && classData.subClasses.length > 0) {
        const validSubs = classData.subClasses.filter(
          (s) =>
            !checkCollision(scheduleToBitmask(s.schedule), this.forbiddenMask),
        );
        if (validSubs.length === 0) hasCollisionInSubClasses = true;
      }

      if (hasCollisionInSubClasses) continue;

      const existing =
        this.validClassesByCourseCode.get(classData.courseCode) || [];
      existing.push(classData);
      this.validClassesByCourseCode.set(classData.courseCode, existing);
    }
  }

  private backtrack(
    currentSelection: SelectedClass[],
    currentMask: WeeklyBitmask,
    requestIndex: number,
    dailyDifficulties: number[],
  ) {
    if (this.results.length >= this.maxResults) return;

    if (requestIndex === this.params.requests.length) {
      this.results.push(
        this.createGeneratedSchedule([...currentSelection], currentMask, [
          ...dailyDifficulties,
        ]),
      );
      return;
    }

    const currentRequest = this.params.requests[requestIndex];

    for (const targetCourseCode of currentRequest.courseCodes) {
      const possibleClasses =
        this.validClassesByCourseCode.get(targetCourseCode);
      if (!possibleClasses || possibleClasses.length === 0) continue;

      for (const classData of possibleClasses) {
        const classMask = scheduleToBitmask(classData.schedule);

        if (checkCollision(currentMask, classMask)) continue;

        const maskWithMainClass = mergeMasks(currentMask, classMask);

        if (classData.subClasses && classData.subClasses.length > 0) {
          for (const sub of classData.subClasses) {
            const subMask = scheduleToBitmask(sub.schedule);
            if (
              !checkCollision(maskWithMainClass, subMask) &&
              !checkCollision(this.forbiddenMask, subMask)
            ) {
              this.commitSelection(
                currentSelection,
                mergeMasks(maskWithMainClass, subMask),
                requestIndex,
                dailyDifficulties,
                currentRequest,
                classData,
                sub,
              );
            }
          }
        } else {
          this.commitSelection(
            currentSelection,
            maskWithMainClass,
            requestIndex,
            dailyDifficulties,
            currentRequest,
            classData,
            undefined,
          );
        }
      }
    }
  }

  private commitSelection(
    currentSelection: SelectedClass[],
    currentMask: WeeklyBitmask,
    requestIndex: number,
    dailyDifficulties: number[],
    currentRequest: CourseRequest,
    classData: ClassData,
    selectedSubClass?: SubClassData,
  ) {
    const diff = currentRequest.difficulty;
    const addedDiffs: number[] = [];
    for (let i = 0; i < 6; i++) {
      let maskForThisClass = classData.schedule.dayOfWeek - 2 === i ? 1 : 0;
      if (selectedSubClass && selectedSubClass.schedule.dayOfWeek - 2 === i)
        maskForThisClass = 1;

      if (maskForThisClass) {
        dailyDifficulties[i] += diff;
        addedDiffs.push(i);
      }
    }

    currentSelection.push({
      classData,
      selectedSubClass,
    });

    this.backtrack(
      currentSelection,
      currentMask,
      requestIndex + 1,
      dailyDifficulties,
    );

    currentSelection.pop();
    for (const i of addedDiffs) {
      dailyDifficulties[i] -= diff;
    }
  }

  private createGeneratedSchedule(
    classes: SelectedClass[],
    finalMask: WeeklyBitmask,
    dailyDifficulties: number[],
  ): GeneratedSchedule {
    let leftmostScore = 0;
    let rightmostScore = 0;
    let preferredScore = 0;

    for (let i = 0; i < 6; i++) {
      const dailyMask = finalMask[i];
      const bitCount = countBits(dailyMask);

      leftmostScore += bitCount * (6 - i);

      rightmostScore += bitCount * (i + 1);

      const preferredDailyMask = this.preferredMask[i];
      const overlappedBits = dailyMask & preferredDailyMask;
      preferredScore += countBits(overlappedBits);
    }

    const activeDays = dailyDifficulties.filter((d) => d > 0);
    let balanceScore = 0;
    if (activeDays.length > 0) {
      const mean = activeDays.reduce((a, b) => a + b, 0) / activeDays.length;
      let variance =
        activeDays.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
        activeDays.length;
      balanceScore = -variance;
    }

    return {
      classes,
      scores: {
        leftmostScore,
        rightmostScore,
        balanceScore,
        preferredScore,
      },
    };
  }
}
