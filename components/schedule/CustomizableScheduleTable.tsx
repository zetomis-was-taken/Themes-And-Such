import React from "react";
import { GeneratedSchedule } from "@/lib/algo/types";

interface CustomizableScheduleTableProps {
  schedule: GeneratedSchedule;
  palette: "pastel" | "vibrant" | "monochrome" | "dark";
  showRoom: boolean;
  showCode: boolean;
  roundedCorners: boolean;
  opacity: number;
}

const DAYS = [2, 3, 4, 5, 6, 7];
const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);

const PALETTES = {
  pastel: [
    { bg: "#fdf2f8", border: "#fbcfe8", text: "#831843" },
    { bg: "#f0fdf4", border: "#bbf7d0", text: "#14532d" },
    { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a" },
    { bg: "#fefce8", border: "#fef08a", text: "#713f12" },
    { bg: "#faf5ff", border: "#e9d5ff", text: "#581c87" },
    { bg: "#ecfeff", border: "#a5f3fc", text: "#164e63" },
    { bg: "#fff1f2", border: "#fecdd3", text: "#881337" },
  ],
  vibrant: [
    { bg: "#ec4899", border: "#be185d", text: "#ffffff" },
    { bg: "#10b981", border: "#047857", text: "#ffffff" },
    { bg: "#3b82f6", border: "#1d4ed8", text: "#ffffff" },
    { bg: "#f59e0b", border: "#b45309", text: "#ffffff" },
    { bg: "#8b5cf6", border: "#6d28d9", text: "#ffffff" },
    { bg: "#06b6d4", border: "#0e7490", text: "#ffffff" },
    { bg: "#f43f5e", border: "#be123c", text: "#ffffff" },
  ],
  monochrome: [
    { bg: "#f3f4f6", border: "#d1d5db", text: "#111827" },
    { bg: "#e5e7eb", border: "#9ca3af", text: "#1f2937" },
    { bg: "#d1d5db", border: "#6b7280", text: "#374151" },
    { bg: "#9ca3af", border: "#4b5563", text: "#ffffff" },
    { bg: "#6b7280", border: "#374151", text: "#ffffff" },
    { bg: "#4b5563", border: "#1f2937", text: "#ffffff" },
    { bg: "#374151", border: "#111827", text: "#ffffff" },
  ],
  dark: [
    { bg: "#1e1e2e", border: "#313244", text: "#cdd6f4" },
    { bg: "#181825", border: "#313244", text: "#b4befe" },
    { bg: "#11111b", border: "#313244", text: "#f38ba8" },
    { bg: "#1e1e2e", border: "#313244", text: "#a6e3a1" },
    { bg: "#181825", border: "#313244", text: "#fab387" },
    { bg: "#11111b", border: "#313244", text: "#89b4fa" },
    { bg: "#1e1e2e", border: "#313244", text: "#cba6f7" },
  ]
};

// Convert hex to rgba for opacity
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CustomizableScheduleTable({ 
  schedule, 
  palette, 
  showRoom, 
  showCode, 
  roundedCorners,
  opacity
}: CustomizableScheduleTableProps) {
  const isDarkTheme = palette === "dark";
  const colors = PALETTES[palette];

  return (
    <div className="w-full relative" style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        className="w-full grid backdrop-blur-sm"
        style={{
          gridTemplateColumns: "60px repeat(6, 1fr)",
          gridTemplateRows: "40px repeat(20, minmax(24px, auto))",
        }}
      >
        {/* Headers */}
        <div 
          className="sticky top-0 left-0 z-10 flex items-center justify-center font-bold text-sm"
          style={{ 
            backgroundColor: isDarkTheme ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)", 
            color: isDarkTheme ? "#fff" : "#000",
            borderBottom: isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
            borderRight: isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)"
          }}
        >
          Tiết
        </div>
        {DAYS.map((day) => (
          <div
            key={`header-${day}`}
            className="sticky top-0 z-10 flex items-center justify-center font-bold text-sm"
            style={{ 
              backgroundColor: isDarkTheme ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)", 
              color: isDarkTheme ? "#fff" : "#000",
              borderBottom: isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              borderRight: isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)"
            }}
          >
            Thứ {day}
          </div>
        ))}

        {/* Grid Cells */}
        {PERIODS.map((period) => {
          const rowStart = (period - 1) * 2 + 2;
          return (
            <React.Fragment key={`bg-row-${period}`}>
              <div
                className="flex items-center justify-center text-xs font-semibold"
                style={{ 
                  gridColumn: 1, 
                  gridRow: `${rowStart} / span 2`,
                  backgroundColor: isDarkTheme ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.5)",
                  color: isDarkTheme ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                  borderBottom: isDarkTheme ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                  borderRight: isDarkTheme ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)"
                }}
              >
                {period}
              </div>
              {DAYS.map((day, dayIdx) => (
                <div
                  key={`bg-${day}-${period}`}
                  style={{
                    gridColumn: dayIdx + 2,
                    gridRow: `${rowStart} / span 2`,
                    borderBottom: isDarkTheme ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)",
                    borderRight: isDarkTheme ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)"
                  }}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* Classes */}
        {schedule.classes.map((selected, idx) => {
          const cStyle = colors[idx % colors.length];
          const bgRgba = hexToRgba(cStyle.bg, opacity);
          const borderRgba = hexToRgba(cStyle.border, opacity > 0.5 ? opacity : 0.5);

          const main = selected.classData;
          const sub = selected.selectedSubClass;

          return (
            <React.Fragment key={`class-${idx}`}>
              {/* Main Class */}
              <div
                className="m-1 p-2 flex flex-col gap-1 overflow-hidden z-20 shadow-sm"
                style={{
                  gridColumn: main.schedule.dayOfWeek - 2 + 2,
                  gridRowStart: (main.schedule.startPeriod - 1) * 2 + 2,
                  gridRowEnd: main.schedule.endPeriod * 2 + 2,
                  backgroundColor: bgRgba,
                  borderColor: borderRgba,
                  borderWidth: "1px",
                  borderStyle: "solid",
                  color: cStyle.text,
                  borderRadius: roundedCorners ? "8px" : "2px"
                }}
              >
                <div className="font-bold text-xs leading-tight line-clamp-2">{main.courseName}</div>
                <div className="font-medium text-[10px] opacity-90">{main.className}</div>
                <div className="mt-auto flex justify-between items-end text-[10px] opacity-80">
                  {showCode && <span>{main.courseCode}</span>}
                  {showRoom && <span className="font-medium">{main.schedule.room}</span>}
                </div>
              </div>

              {/* Sub Class */}
              {sub && (
                <div
                  className="m-1 p-2 flex flex-col gap-1 overflow-hidden z-20 shadow-sm"
                  style={{
                    gridColumn: sub.schedule.dayOfWeek - 2 + 2,
                    gridRowStart: (sub.schedule.startPeriod - 1) * 2 + 2,
                    gridRowEnd: sub.schedule.endPeriod * 2 + 2,
                    backgroundColor: bgRgba,
                    borderColor: borderRgba,
                    borderWidth: "1px",
                    borderStyle: "dashed",
                    color: cStyle.text,
                    borderRadius: roundedCorners ? "8px" : "2px",
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} 10px, ${isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} 20px)`
                  }}
                >
                  <div className="font-bold text-xs leading-tight line-clamp-1">
                    {main.courseName} <span className="opacity-75 font-normal">({sub.type === "practical" ? "TH" : "BT"})</span>
                  </div>
                  <div className="font-medium text-[10px] opacity-90">Nhóm {sub.groupCode}</div>
                  <div className="mt-auto flex justify-between items-end text-[10px] opacity-80">
                    {showCode && <span>{main.courseCode}</span>}
                    {showRoom && <span className="font-medium">{sub.schedule.room}</span>}
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
