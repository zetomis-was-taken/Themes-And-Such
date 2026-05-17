import { ClassData, CourseRequest, GeneratedSchedule, GeneratorParams, SelectedClass, SubClassData, TimeConstraints } from './types';
import { checkCollision, createEmptyMask, mergeMasks, schedulesToBitmask, scheduleToBitmask, WeeklyBitmask, countBits } from './bitmask';

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
    this.forbiddenMask = schedulesToBitmask(params.constraints.forbiddenTimes || []);
    this.preferredMask = schedulesToBitmask(params.constraints.preferredTimes || []);
    this.validClassesByCourseCode = new Map();
    this.maxResults = params.maxResults || 1000;
  }

  public generate(): GeneratedSchedule[] {
    this.preProcessClasses();
    
    // Sort requests internally to optimize backtracking or just process as provided.
    // For now, process sequentially.
    this.backtrack([], createEmptyMask(), 0, new Array(6).fill(0));

    return this.results;
  }

  /**
   * Bước 1: Tiền xử lý
   * Lọc bỏ những lớp đụng với thời gian cấm (Hard constraint).
   * Group các lớp hợp lệ theo courseCode.
   */
  private preProcessClasses() {
    for (const classData of this.params.availableClasses) {
      const classMask = scheduleToBitmask(classData.schedule);

      // Check collision with forbidden times
      if (checkCollision(classMask, this.forbiddenMask)) continue;

      let hasCollisionInSubClasses = false;
      
      // Check subClasses collision
      if (classData.subClasses && classData.subClasses.length > 0) {
        // We only need at least ONE sub class that doesn't collide with forbidden times
        const validSubs = classData.subClasses.filter(
          s => !checkCollision(scheduleToBitmask(s.schedule), this.forbiddenMask)
        );
        if (validSubs.length === 0) hasCollisionInSubClasses = true;
      }

      if (hasCollisionInSubClasses) continue;

      // Class is initially valid
      const existing = this.validClassesByCourseCode.get(classData.courseCode) || [];
      existing.push(classData);
      this.validClassesByCourseCode.set(classData.courseCode, existing);
    }
  }

  /**
   * Bước 2: Backtracking tìm các tổ hợp lịch học thỏa mãn
   */
  private backtrack(
    currentSelection: SelectedClass[],
    currentMask: WeeklyBitmask,
    requestIndex: number,
    dailyDifficulties: number[] // Mảng 6 phần tử lưu tổng độ khó của từng ngày
  ) {
    if (this.results.length >= this.maxResults) return;

    // Base case: Đã duyệt xong tất cả các Course Requests
    if (requestIndex === this.params.requests.length) {
      this.results.push(this.createGeneratedSchedule([...currentSelection], currentMask, [...dailyDifficulties]));
      return;
    }

    const currentRequest = this.params.requests[requestIndex];

    // Thử từng courseCode trong mảng courseCodes của request này (OR condition)
    for (const targetCourseCode of currentRequest.courseCodes) {
      const possibleClasses = this.validClassesByCourseCode.get(targetCourseCode);
      if (!possibleClasses || possibleClasses.length === 0) continue;

      for (const classData of possibleClasses) {
        const classMask = scheduleToBitmask(classData.schedule);

        // Check if main class collides with current schedule
        if (checkCollision(currentMask, classMask)) continue;

        const maskWithMainClass = mergeMasks(currentMask, classMask);

        if (classData.subClasses && classData.subClasses.length > 0) {
          for (const sub of classData.subClasses) {
            const subMask = scheduleToBitmask(sub.schedule);
            if (!checkCollision(maskWithMainClass, subMask) && !checkCollision(this.forbiddenMask, subMask)) {
              this.commitSelection(
                currentSelection, mergeMasks(maskWithMainClass, subMask),
                requestIndex, dailyDifficulties, currentRequest, classData, sub
              );
            }
          }
        } else {
          this.commitSelection(
            currentSelection, maskWithMainClass,
            requestIndex, dailyDifficulties, currentRequest, classData, undefined
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
    selectedSubClass?: SubClassData
  ) {
    const diff = currentRequest.difficulty;
    const addedDiffs: number[] = [];
    for (let i = 0; i < 6; i++) {
      let maskForThisClass = classData.schedule.dayOfWeek - 2 === i ? 1 : 0;
      if (selectedSubClass && selectedSubClass.schedule.dayOfWeek - 2 === i) maskForThisClass = 1;
      
      if (maskForThisClass) {
        dailyDifficulties[i] += diff;
        addedDiffs.push(i);
      }
    }

    currentSelection.push({
      classData,
      selectedSubClass
    });

    this.backtrack(currentSelection, currentMask, requestIndex + 1, dailyDifficulties);

    // Revert for backtracking
    currentSelection.pop();
    for (const i of addedDiffs) {
      dailyDifficulties[i] -= diff;
    }
  }

  /**
   * Bước 3: Tính điểm cho tổ hợp tìm được
   */
  private createGeneratedSchedule(
    classes: SelectedClass[],
    finalMask: WeeklyBitmask,
    dailyDifficulties: number[]
  ): GeneratedSchedule {
    let leftmostScore = 0;
    let rightmostScore = 0;
    let preferredScore = 0;

    for (let i = 0; i < 6; i++) {
      const dailyMask = finalMask[i];
      const bitCount = countBits(dailyMask); // Số tiết học trong ngày này
      
      // Leftmost: dồn lên Thứ 2 (index 0) -> Thứ 7 (index 5)
      // Hệ số giảm dần từ trái sang phải
      leftmostScore += bitCount * (6 - i);
      
      // Rightmost: dồn về Thứ 7
      // Hệ số tăng dần từ trái sang phải
      rightmostScore += bitCount * (i + 1);

      // Preferred Time: Kiểm tra overlap với preferredTimes
      const preferredDailyMask = this.preferredMask[i];
      const overlappedBits = dailyMask & preferredDailyMask;
      preferredScore += countBits(overlappedBits);
    }

    // Tính balanceScore bằng phương sai (variance) của dailyDifficulties
    // Variance càng thấp -> BalanceScore càng cao
    const activeDays = dailyDifficulties.filter(d => d > 0);
    let balanceScore = 0;
    if (activeDays.length > 0) {
      const mean = activeDays.reduce((a, b) => a + b, 0) / activeDays.length;
      let variance = activeDays.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / activeDays.length;
      // Để balanceScore cao là tốt, ta dùng số âm của variance hoặc lấy Hằng số - variance
      // Ở đây dùng số nghịch đảo hoặc âm. Ta chọn lưu dạng âm, client sẽ sort từ cao tới thấp
      balanceScore = -variance;
    }

    return {
      classes,
      scores: {
        leftmostScore,
        rightmostScore,
        balanceScore,
        preferredScore
      }
    };
  }
}
