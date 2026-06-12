import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ClassData, CourseRequest, GeneratedSchedule } from "@/lib/algo/types";
import { WeeklyBitmask, createEmptyMask } from "@/lib/algo/bitmask";

export const classesAtom = atomWithStorage<ClassData[]>("schedule_classes", []);
export const preferredMaskAtom = atomWithStorage<WeeklyBitmask>(
  "schedule_preferred_mask",
  createEmptyMask()
);
export const forbiddenMaskAtom = atomWithStorage<WeeklyBitmask>(
  "schedule_forbidden_mask",
  createEmptyMask()
);
export const requestsAtom = atomWithStorage<CourseRequest[]>(
  "schedule_requests",
  []
);
export const sortByAtom = atomWithStorage<string>(
  "schedule_sort_by",
  "totalScore"
);
export const maxResultsAtom = atomWithStorage<number>("schedule_max_results", 50);

// Results shouldn't necessarily be persisted across sessions, but keeping it in memory is good.
// We can just use standard atom or atomWithStorage depending on preference. Let's use atom for results so it clears on refresh.
export const resultsAtom = atom<GeneratedSchedule[] | null>(null);
