import React from "react";
import { GeneratedSchedule } from "@/lib/algo/types";

interface ScheduleTableProps {
  schedule: GeneratedSchedule;
}

const DAYS = [2, 3, 4, 5, 6, 7];
const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);

const COLORS = [
  "bg-blue-100 border-blue-200 text-blue-800",
  "bg-emerald-100 border-emerald-200 text-emerald-800",
  "bg-violet-100 border-violet-200 text-violet-800",
  "bg-amber-100 border-amber-200 text-amber-800",
  "bg-pink-100 border-pink-200 text-pink-800",
  "bg-cyan-100 border-cyan-200 text-cyan-800",
  "bg-rose-100 border-rose-200 text-rose-800",
  "bg-indigo-100 border-indigo-200 text-indigo-800",
];

export function ScheduleTable({ schedule }: ScheduleTableProps) {
  return (
    <div className="w-full overflow-x-auto border rounded-lg bg-white shadow-sm">
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
                  className="border-b border-r last:border-r-0 border-dashed border-gray-100"
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
          const main = selected.classData;
          const sub = selected.selectedSubClass;

          return (
            <React.Fragment key={`class-${idx}`}>
              {/* Main Class */}
              <div
                className={`m-1 p-2 rounded-md border text-xs shadow-sm flex flex-col gap-1 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 z-20 ${colorClass}`}
                style={{
                  gridColumn: main.schedule.dayOfWeek - 2 + 2,
                  gridRowStart: (main.schedule.startPeriod - 1) * 2 + 2,
                  gridRowEnd: main.schedule.endPeriod * 2 + 2,
                }}
              >
                <div className="font-bold line-clamp-2">{main.courseName}</div>
                <div className="font-medium opacity-90">{main.className}</div>
                <div className="mt-auto flex justify-between items-end text-[10px] opacity-80">
                  <span>{main.courseCode}</span>
                  <span className="font-medium">{main.schedule.room}</span>
                </div>
              </div>

              {/* Sub Class if any */}
              {sub && (
                <div
                  className={`m-1 p-2 rounded-md border text-xs shadow-sm flex flex-col gap-1 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 z-20 ${colorClass}`}
                  style={{
                    gridColumn: sub.schedule.dayOfWeek - 2 + 2,
                    gridRowStart: (sub.schedule.startPeriod - 1) * 2 + 2,
                    gridRowEnd: sub.schedule.endPeriod * 2 + 2,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)",
                  }}
                >
                  <div className="font-bold line-clamp-1">
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
