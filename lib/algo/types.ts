import { z } from "zod";

export const ScheduleTimeSchema = z.object({
  dayOfWeek: z.number().min(2).max(7),
  startPeriod: z.number().min(1).max(10),
  endPeriod: z.number().min(1).max(10),
  room: z.string().optional(),
});
export type ScheduleTime = z.infer<typeof ScheduleTimeSchema>;

export const SubClassDataSchema = z.object({
  type: z.enum(["practical", "exercise"]),
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

export const CourseRequestSchema = z.object({
  courseCodes: z.array(z.string()),
  difficulty: z.number(),
});
export type CourseRequest = z.infer<typeof CourseRequestSchema>;

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
