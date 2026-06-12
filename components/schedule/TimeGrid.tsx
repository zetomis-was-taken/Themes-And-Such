"use client";

import React, { useState } from "react";
import { WeeklyBitmask, createDailyMask } from "@/lib/algo/bitmask";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Check, X } from "lucide-react";

interface TimeGridProps {
  preferredMask: WeeklyBitmask;
  forbiddenMask: WeeklyBitmask;
  onChange: (preferred: WeeklyBitmask, forbidden: WeeklyBitmask) => void;
}

const DAYS = [2, 3, 4, 5, 6, 7];
const PERIODS = Array.from({ length: 10 }, (_, i) => i + 1);

type Mode = "preferred" | "forbidden";

export function TimeGrid({
  preferredMask,
  forbiddenMask,
  onChange,
}: TimeGridProps) {
  const [mode, setMode] = useState<Mode>("preferred");

  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<"add" | "remove">("add");

  const handlePointerDown = (dayIdx: number, period: number) => {
    const cellMask = createDailyMask(period, period);
    const isPreferred = (preferredMask[dayIdx] & cellMask) !== 0;
    const isForbidden = (forbiddenMask[dayIdx] & cellMask) !== 0;

    let action: "add" | "remove" = "add";
    if (mode === "preferred" && isPreferred) action = "remove";
    if (mode === "forbidden" && isForbidden) action = "remove";

    setIsDragging(true);
    setDragAction(action);
    applySelection(dayIdx, period, mode, action);
  };

  const handlePointerEnter = (dayIdx: number, period: number) => {
    if (isDragging) {
      applySelection(dayIdx, period, mode, dragAction);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const applySelection = (
    dayIdx: number,
    period: number,
    currentMode: Mode,
    action: "add" | "remove",
  ) => {
    const cellMask = createDailyMask(period, period);

    let newPref = [...preferredMask] as WeeklyBitmask;
    let newForb = [...forbiddenMask] as WeeklyBitmask;

    if (currentMode === "preferred") {
      if (action === "add") {
        newPref[dayIdx] |= cellMask;
        newForb[dayIdx] &= ~cellMask;
      } else {
        newPref[dayIdx] &= ~cellMask;
      }
    } else {
      if (action === "add") {
        newForb[dayIdx] |= cellMask;
        newPref[dayIdx] &= ~cellMask;
      } else {
        newForb[dayIdx] &= ~cellMask;
      }
    }

    onChange(newPref, newForb);
  };

  return (
    <div
      className="space-y-4 select-none touch-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Chế độ tô màu (kéo thả chuột)
        </h3>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => v && setMode(v as Mode)}
        >
          <ToggleGroupItem
            value="preferred"
            aria-label="Preferred times"
            className="data-[state=on]:bg-green-100 data-[state=on]:text-green-800"
          >
            <Check className="h-4 w-4 mr-2" /> Muốn học
          </ToggleGroupItem>
          <ToggleGroupItem
            value="forbidden"
            aria-label="Forbidden times"
            className="data-[state=on]:bg-red-100 data-[state=on]:text-red-800"
          >
            <X className="h-4 w-4 mr-2" /> Tránh học
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="border rounded-md overflow-x-auto bg-card shadow-sm">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-7 border-b bg-muted/50 text-sm font-medium sticky top-0 z-20">
            <div className="p-2 text-center border-r sticky left-0 z-30 bg-muted/50">Tiết</div>
          {DAYS.map((day) => (
            <div key={day} className="p-2 text-center border-r last:border-r-0">
              Thứ {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {PERIODS.map((period) => (
            <React.Fragment key={`period-${period}`}>
              <div className="p-1 border-b border-r bg-muted/20 text-center text-xs font-medium flex items-center justify-center text-muted-foreground sticky left-0 z-10">
                {period}
              </div>
              {DAYS.map((day, dayIdx) => {
                const cellMask = createDailyMask(period, period);
                const isPref = (preferredMask[dayIdx] & cellMask) !== 0;
                const isForb = (forbiddenMask[dayIdx] & cellMask) !== 0;

                let bgClass = "bg-card hover:bg-muted";
                if (isPref)
                  bgClass = "bg-green-500 hover:bg-green-600 border-green-600";
                else if (isForb)
                  bgClass = "bg-red-500 hover:bg-red-600 border-red-600";

                return (
                  <div
                    key={`cell-${day}-${period}`}
                    className={`border-b border-r last:border-r-0 h-8 transition-colors cursor-crosshair ${bgClass}`}
                    onPointerDown={(e) => {
                      e.currentTarget.releasePointerCapture(e.pointerId);
                      handlePointerDown(dayIdx, period);
                    }}
                    onPointerEnter={() => handlePointerEnter(dayIdx, period)}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        </div>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground justify-end">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div> Ưu tiên học
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Không học
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 border rounded-sm bg-card"></div> Bình thường
        </span>
      </div>
    </div>
  );
}
