import React from "react";
import { GeneratedSchedule } from "@/lib/algo/types";

interface CustomizableScheduleTableProps {
  schedule: GeneratedSchedule;
  palette: "pastel" | "vibrant" | "monochrome" | "dark" | "custom";
  customColors?: string[];
  fontFamily: string;
  fontSizeBase: number;
  showRoom: boolean;
  showCode: boolean;
  borderRadius: number;
  borderWidth: number;
  opacity: number;
  tableBgOpacity: number;
  gridLineColor: string;
  gridLineOpacity: number;
  gridLineWidth: number;
  gridLineStyle: string;
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
  if (!hex || !hex.startsWith('#')) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Get contrasting text color (black or white)
function getContrastYIQ(hexcolor: string) {
  if (!hexcolor || !hexcolor.startsWith('#')) return '#000000';
  const r = parseInt(hexcolor.slice(1, 3), 16) || 0;
  const g = parseInt(hexcolor.slice(3, 5), 16) || 0;
  const b = parseInt(hexcolor.slice(5, 7), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}

export function CustomizableScheduleTable({ 
  schedule, 
  palette,
  customColors = [],
  fontFamily,
  fontSizeBase,
  showRoom, 
  showCode, 
  borderRadius,
  borderWidth,
  opacity,
  tableBgOpacity,
  gridLineColor,
  gridLineOpacity,
  gridLineWidth,
  gridLineStyle
}: CustomizableScheduleTableProps) {
  const isDarkTheme = palette === "dark";
  
  // Resolve colors
  let colors: { bg: string; border: string; text: string }[] = [];
  if (palette === "custom" && customColors.length > 0) {
    colors = customColors.map(c => ({
      bg: c,
      border: c,
      text: getContrastYIQ(c)
    }));
  } else {
    colors = PALETTES[palette as keyof typeof PALETTES] || PALETTES.pastel;
  }

  const borderStyleStr = `${gridLineWidth}px ${gridLineStyle} ${hexToRgba(gridLineColor, gridLineOpacity)}`;
  // Sub-class cells use the same border style
  const borderSubStr = `${gridLineWidth}px ${gridLineStyle} ${hexToRgba(gridLineColor, gridLineOpacity)}`;

  return (
    <div className="w-full relative" style={{ fontFamily: fontFamily }}>
      <div
        className="w-full grid"
        style={{
          gridTemplateColumns: "60px repeat(6, 1fr)",
          gridTemplateRows: "40px repeat(20, minmax(24px, auto))",
        }}
      >
        {/* Headers */}
        <div 
          className="sticky top-0 left-0 z-30 flex items-center justify-center font-bold"
          style={{ 
            fontSize: `${fontSizeBase}px`,
            backgroundColor: isDarkTheme ? `rgba(0,0,0,1)` : `rgba(255,255,255,1)`, 
            color: isDarkTheme ? "#fff" : "#000",
            borderBottom: borderStyleStr,
            borderRight: borderStyleStr
          }}
        >
          Tiết
        </div>
        {DAYS.map((day) => (
          <div
            key={`header-${day}`}
            className="sticky top-0 z-10 flex items-center justify-center font-bold"
            style={{ 
              fontSize: `${fontSizeBase}px`,
              backgroundColor: isDarkTheme ? `rgba(0,0,0,${tableBgOpacity})` : `rgba(255,255,255,${tableBgOpacity})`, 
              color: isDarkTheme ? "#fff" : "#000",
              borderBottom: borderStyleStr,
              borderRight: borderStyleStr
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
                className="sticky left-0 z-20 flex items-center justify-center font-semibold"
                style={{ 
                  fontSize: `${fontSizeBase - 2}px`,
                  gridColumn: 1, 
                  gridRow: `${rowStart} / span 2`,
                  backgroundColor: isDarkTheme ? `rgba(0,0,0,1)` : `rgba(255,255,255,1)`,
                  color: isDarkTheme ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
                  borderBottom: borderStyleStr,
                  borderRight: borderStyleStr
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
                    borderBottom: borderSubStr,
                    borderRight: borderSubStr
                  }}
                />
              ))}
            </React.Fragment>
          );
        })}

        {/* Classes */}
        {schedule.classes.map((selected, idx) => {
          const cStyle = colors[idx % colors.length] || { bg: '#ffffff', border: '#cccccc', text: '#000000' };
          const bgRgba = hexToRgba(cStyle.bg, opacity);
          const borderRgba = hexToRgba(cStyle.border, opacity > 0.5 ? opacity : 0.5);

          const main = selected.classData;
          const sub = selected.selectedSubClass;

          return (
            <React.Fragment key={`class-${idx}`}>
              {/* Main Class */}
              <div
                className="m-1 p-2 flex flex-col gap-1 overflow-hidden z-20 shadow-sm transition-all"
                style={{
                  gridColumn: main.schedule.dayOfWeek - 2 + 2,
                  gridRowStart: (main.schedule.startPeriod - 1) * 2 + 2,
                  gridRowEnd: main.schedule.endPeriod * 2 + 2,
                  backgroundColor: bgRgba,
                  borderColor: borderRgba,
                  borderWidth: `${borderWidth}px`,
                  borderStyle: "solid",
                  color: cStyle.text,
                  borderRadius: `${borderRadius}px`
                }}
              >
                <div className="font-bold leading-tight line-clamp-2" style={{ fontSize: `${fontSizeBase}px` }}>{main.courseName}</div>
                <div className="font-medium opacity-90" style={{ fontSize: `${Math.max(10, fontSizeBase - 4)}px` }}>{main.className}</div>
                <div className="mt-auto flex justify-between items-end opacity-80" style={{ fontSize: `${Math.max(10, fontSizeBase - 4)}px` }}>
                  {showCode && <span>{main.courseCode}</span>}
                  {showRoom && <span className="font-medium">{main.schedule.room}</span>}
                </div>
              </div>

              {/* Sub Class */}
              {sub && (
                <div
                  className="m-1 p-2 flex flex-col gap-1 overflow-hidden z-20 shadow-sm transition-all"
                  style={{
                    gridColumn: sub.schedule.dayOfWeek - 2 + 2,
                    gridRowStart: (sub.schedule.startPeriod - 1) * 2 + 2,
                    gridRowEnd: sub.schedule.endPeriod * 2 + 2,
                    backgroundColor: bgRgba,
                    borderColor: borderRgba,
                    borderWidth: `${borderWidth}px`,
                    borderStyle: "dashed",
                    color: cStyle.text,
                    borderRadius: `${borderRadius}px`,
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} 10px, ${isDarkTheme ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} 20px)`
                  }}
                >
                  <div className="font-bold leading-tight line-clamp-1" style={{ fontSize: `${fontSizeBase}px` }}>
                    {main.courseName} <span className="opacity-75 font-normal">({sub.type === "practical" ? "TH" : "BT"})</span>
                  </div>
                  <div className="font-medium opacity-90" style={{ fontSize: `${Math.max(10, fontSizeBase - 4)}px` }}>Nhóm {sub.groupCode}</div>
                  <div className="mt-auto flex justify-between items-end opacity-80" style={{ fontSize: `${Math.max(10, fontSizeBase - 4)}px` }}>
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
