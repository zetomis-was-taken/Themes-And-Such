import { z } from 'zod';

// 1. Dữ liệu các lớp mở
export const ScheduleTimeSchema = z.object({
  dayOfWeek: z.number().min(2).max(7),
  startPeriod: z.number().min(1).max(10),
  endPeriod: z.number().min(1).max(10),
  room: z.string().optional(),
});
export type ScheduleTime = z.infer<typeof ScheduleTimeSchema>;

export const SubClassDataSchema = z.object({
  type: z.enum(['practical', 'exercise']),
  groupCode: z.string(),
  schedule: ScheduleTimeSchema,
});
export type SubClassData = z.infer<typeof SubClassDataSchema>;

export const ClassDataSchema = z.object({
  className: z.string(),
  courseCode: z.string(),
  courseName: z.string(),
  schedule: ScheduleTimeSchema,
  subClasses: z.array(SubClassDataSchema).optional(),
});
export type ClassData = z.infer<typeof ClassDataSchema>;

// 2. Yêu cầu của người dùng
export const CourseRequestSchema = z.object({
  courseCodes: z.array(z.string()),
  difficulty: z.number(),
});
export type CourseRequest = z.infer<typeof CourseRequestSchema>;

// 3. Ràng buộc thời gian & Tham số truyền vào
export const TimeConstraintsSchema = z.object({
  preferredTimes: z.array(ScheduleTimeSchema),
  forbiddenTimes: z.array(ScheduleTimeSchema),
});
export type TimeConstraints = z.infer<typeof TimeConstraintsSchema>;

export const GeneratorParamsSchema = z.object({
  availableClasses: z.array(ClassDataSchema),
  requests: z.array(CourseRequestSchema),
  constraints: TimeConstraintsSchema,
  maxResults: z.number().optional(),
});
export type GeneratorParams = z.infer<typeof GeneratorParamsSchema>;

// 4. Kết quả trả về
export const SelectedClassSchema = z.object({
  classData: ClassDataSchema,
  selectedSubClass: SubClassDataSchema.optional(),
});
export type SelectedClass = z.infer<typeof SelectedClassSchema>;

export const GeneratedScheduleSchema = z.object({
  classes: z.array(SelectedClassSchema),
  scores: z.object({
    leftmostScore: z.number(),
    rightmostScore: z.number(),
    balanceScore: z.number(),
    preferredScore: z.number(),
  }),
});
export type GeneratedSchedule = z.infer<typeof GeneratedScheduleSchema>;
