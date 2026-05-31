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
  createDailyMask,
} from "./bitmask";

export class ScheduleGenerator {
  private params: GeneratorParams;
  private forbiddenMask: WeeklyBitmask;
  private preferredMask: WeeklyBitmask;
  private validClassesByCourseCode: Map<string, ClassData[]>;
  private results: GeneratedSchedule[];
  private maxResults: number;
  private morningMaskTemplate: number;
  private afternoonMaskTemplate: number;

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
    
    // Tiết 1-5 (Sáng)
    this.morningMaskTemplate = createDailyMask(1, 5);
    // Tiết 6-12 (Chiều/Tối)
    this.afternoonMaskTemplate = createDailyMask(6, 12);
  }

  public generate(): GeneratedSchedule[] {
    this.preProcessClasses();
    this.backtrack([], createEmptyMask(), 0, new Array(6).fill(0));
    return this.results;
  }

  private preProcessClasses() {
    for (const classData of this.params.availableClasses) {
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
            if (!checkCollision(maskWithMainClass, subMask)) {
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
    let avoidScore = 0;
    let morningScore = 0;
    let afternoonScore = 0;

    for (let i = 0; i < 6; i++) {
      const dailyMask = finalMask[i];
      const bitCount = countBits(dailyMask);

      leftmostScore += bitCount * (6 - i);
      rightmostScore += bitCount * (i + 1);

      const preferredDailyMask = this.preferredMask[i];
      preferredScore += countBits(dailyMask & preferredDailyMask);
      
      const avoidDailyMask = this.forbiddenMask[i];
      avoidScore += countBits(dailyMask & avoidDailyMask);

      morningScore += countBits(dailyMask & this.morningMaskTemplate);
      afternoonScore += countBits(dailyMask & this.afternoonMaskTemplate);
    }

    // Tránh học bị phạt nặng (ví dụ: -20 điểm cho mỗi bit vi phạm)
    const avoidPenalty = avoidScore * -20;
    const hasViolations = avoidScore > 0;

    // Tính điểm cân bằng độ khó
    const activeDaysCount = dailyDifficulties.filter(d => d > 0).length;
    let balanceScore = 0;
    if (activeDaysCount > 0) {
      const sum = dailyDifficulties.reduce((a, b) => a + b, 0);
      // Chỉ tính trung bình trên các ngày CÓ đi học
      const mean = sum / activeDaysCount;
      const variance =
        dailyDifficulties
          .filter(d => d > 0)
          .reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / activeDaysCount;
      // Nghịch đảo phương sai hoặc dùng dấu âm để cân bằng (phương sai thấp = điểm cao)
      // Cộng thêm một hằng số để điểm dương
      balanceScore = Math.max(0, 50 - Math.round(variance * 100) / 100);
    }

    // Tổng điểm (Trọng số tuỳ chọn, có thể điều chỉnh sau)
    const totalScore = 
      preferredScore * 5 + 
      avoidPenalty + 
      balanceScore + 
      (leftmostScore + rightmostScore + morningScore + afternoonScore) / 4;

    return {
      classes,
      scores: {
        preferredScore,
        avoidScore: avoidPenalty,
        balanceScore,
        morningScore,
        afternoonScore,
        leftmostScore,
        rightmostScore,
        totalScore: Math.round(totalScore),
      },
      hasViolations,
    };
  }
}
