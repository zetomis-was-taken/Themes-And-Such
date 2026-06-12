import React from "react";
import { GeneratedSchedule } from "@/lib/algo/types";
import { getCourseSemesterHalf, SemesterHalf } from "@/lib/algo/bitmask";

interface ScheduleTableProps {
  schedule: GeneratedSchedule;
  onRemoveClass?: (index: number) => void;
  onEditClass?: (index: number) => void;
  editingIndex?: number | null;
}

const DAYS = [2, 3, 4, 5, 6, 7];
const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);

const COLORS = [
  "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
  "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
  "bg-violet-100 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300",
  "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-300",
  "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300",
  "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300",
  "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300",
];

import { X, Edit2 } from "lucide-react";

export function ScheduleTable({ schedule, onRemoveClass, onEditClass, editingIndex }: ScheduleTableProps) {
  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-card shadow-sm">
      <div
        className="min-w-[700px] grid"
        style={{
          gridTemplateColumns: "60px repeat(6, 1fr)",
          gridTemplateRows: "40px repeat(20, minmax(20px, auto))",
        }}
      >
        {/* Headers */}
        <div className="sticky top-0 left-0 z-10 bg-muted/80 border-b border-r flex items-center justify-center font-semibold text-sm">
          Tiết
        </div>
        {DAYS.map((day) => (
          <div
            key={`header-${day}`}
            className="sticky top-0 z-10 bg-muted/80 border-b border-r last:border-r-0 flex items-center justify-center font-semibold text-sm"
          >
            Thứ {day}
          </div>
        ))}

        {/* Grid Cells for background styling */}
        {PERIODS.map((period) => {
          const rowStart = (period - 1) * 2 + 2;
          return (
            <React.Fragment key={`bg-row-${period}`}>
              <div
                className="border-b border-r bg-muted/10 flex items-center justify-center text-xs text-muted-foreground font-medium"
                style={{ gridColumn: 1, gridRow: `${rowStart} / span 2` }}
              >
                {period}
              </div>
              {DAYS.map((day, dayIdx) => (
                <div
                  key={`bg-${day}-${period}`}
                  className="border-b border-r last:border-r-0 border-dashed border-border/50"
                  style={{
                    gridColumn: dayIdx + 2,
                    gridRow: `${rowStart} / span 2`,
                  }}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* Classes */}
        {schedule.classes.map((selected, idx) => {
          const colorClass = COLORS[idx % COLORS.length];
          const isEditing = idx === editingIndex;
          const blockStyle = isEditing
            ? "ring-2 ring-primary ring-offset-1 z-30 opacity-100"
            : (editingIndex !== undefined && editingIndex !== null)
            ? "opacity-40 grayscale"
            : "";
          const main = selected.classData;
          const sub = selected.selectedSubClass;
          const half = getCourseSemesterHalf(main.courseCode);
          
          const placementStyle = half === "first" 
            ? "justify-self-start w-[48%]" 
            : half === "second" 
            ? "justify-self-end w-[48%]" 
            : "w-auto stretch";

          return (
            <React.Fragment key={`class-${idx}`}>
              {/* Main Class */}
              <div
                className={`m-1 p-2 rounded-md border text-xs shadow-sm flex flex-col gap-1 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 z-20 relative ${colorClass} ${blockStyle} ${placementStyle}`}
                style={{
                  gridColumn: main.schedule.dayOfWeek - 2 + 2,
                  gridRowStart: (main.schedule.startPeriod - 1) * 2 + 2,
                  gridRowEnd: main.schedule.endPeriod * 2 + 2,
                }}
              >
                <div className="absolute top-1 right-1 flex gap-1 z-30">
                  {onEditClass && (
                    <button 
                      onClick={() => onEditClass(idx)}
                      className="p-0.5 rounded bg-background/50 hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {onRemoveClass && (
                    <button 
                      onClick={() => onRemoveClass(idx)}
                      className="p-0.5 rounded bg-background/50 hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
                      title="Xóa"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {half !== "full" && (
                  <div className="text-[10px] font-bold uppercase opacity-80 mb-0.5">
                    {half === "first" ? "Nửa đầu" : "Nửa sau"}
                  </div>
                )}
                <div className="font-bold line-clamp-2 pr-10">{main.courseName}</div>
                <div className="font-medium opacity-90">{main.className}</div>
                <div className="mt-auto flex justify-between items-end text-[10px] opacity-80">
                  <span>{main.courseCode}</span>
                  <span className="font-medium">{main.schedule.room}</span>
                </div>
              </div>

              {/* Sub Class if any */}
              {sub && (
                <div
                  className={`m-1 p-2 rounded-md border text-xs shadow-sm flex flex-col gap-1 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 z-20 relative ${colorClass} ${blockStyle} ${placementStyle}`}
                  style={{
                    gridColumn: sub.schedule.dayOfWeek - 2 + 2,
                    gridRowStart: (sub.schedule.startPeriod - 1) * 2 + 2,
                    gridRowEnd: sub.schedule.endPeriod * 2 + 2,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)",
                  }}
                >
                  <div className="absolute top-1 right-1 flex gap-1 z-30">
                    {onEditClass && (
                      <button 
                        onClick={() => onEditClass(idx)}
                        className="p-0.5 rounded bg-background/50 hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {onRemoveClass && (
                      <button 
                        onClick={() => onRemoveClass(idx)}
                        className="p-0.5 rounded bg-background/50 hover:bg-destructive/90 hover:text-destructive-foreground transition-colors"
                        title="Xóa"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {half !== "full" && (
                    <div className="text-[10px] font-bold uppercase opacity-80 mb-0.5">
                      {half === "first" ? "Nửa đầu" : "Nửa sau"}
                    </div>
                  )}
                  <div className="font-bold line-clamp-1 pr-10">
                    {main.courseName}{" "}
                    <span className="opacity-75 font-normal">
                      ({sub.type === "practical" ? "TH" : "BT"})
                    </span>
                  </div>
                  <div className="font-medium opacity-90">
                    Nhóm {sub.groupCode}
                  </div>
                  <div className="mt-auto flex justify-between items-end text-[10px] opacity-80">
                    <span>{main.courseCode}</span>
                    <span className="font-medium">{sub.schedule.room}</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
