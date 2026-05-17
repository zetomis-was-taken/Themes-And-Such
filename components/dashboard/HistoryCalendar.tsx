"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyNote } from "@/lib/db/notes/actions";
import { MarkdownNote } from "@/components/dashboard/MarkdownNote";
import { Badge } from "@/components/ui/badge";
import { ClockAndClasses } from "@/components/dashboard/ClockAndClasses";

interface ClassItem {
  courseName: string;
  className: string;
  room: string;
  startPeriod: number;
  endPeriod: number;
  dayOfWeek: string;
  type: string;
}

interface HistoryCalendarProps {
  notesDates: string[];
  allClasses: ClassItem[];
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0 is Sunday
}

export function HistoryCalendar({ notesDates, allClasses }: HistoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = async (day: number) => {
    // Format YYYY-MM-DD local timezone
    const dateObj = new Date(year, month, day);
    const dateStr = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, "0"),
      String(dateObj.getDate()).padStart(2, "0")
    ].join("-");

    setSelectedDateStr(dateStr);
    setIsLoading(true);
    try {
      const content = await getDailyNote(dateStr);
      setNoteContent(content);
    } catch (e) {
      setNoteContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  let firstDay = getFirstDayOfMonth(year, month);
  // Convert so Monday is 0, Sunday is 6
  firstDay = firstDay === 0 ? 6 : firstDay - 1; 

  const daysGrid = [];
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  // Determine selected dayOfWeek for classes
  let selectedClasses: ClassItem[] = [];
  if (selectedDateStr) {
    const d = new Date(selectedDateStr);
    const jsDay = d.getDay();
    const dayOfWeek = jsDay === 0 ? "8" : String(jsDay + 1);
    selectedClasses = allClasses.filter(c => c.dayOfWeek === dayOfWeek).sort((a, b) => a.startPeriod - b.startPeriod);
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-bold text-lg">{MONTH_NAMES[month]}, {year}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-muted-foreground mb-2">
          <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysGrid.map((day, idx) => {
            if (!day) return <div key={idx} className="h-10" />;
            
            const dateObj = new Date(year, month, day);
            const dateStr = [
              dateObj.getFullYear(),
              String(dateObj.getMonth() + 1).padStart(2, "0"),
              String(dateObj.getDate()).padStart(2, "0")
            ].join("-");
            
            const hasNote = notesDates.includes(dateStr);
            const isToday = new Date().toISOString().split("T")[0] === dateStr;

            return (
              <button
                key={idx}
                onClick={() => handleSelectDate(day)}
                className={`relative h-10 w-full rounded-md flex items-center justify-center text-sm transition-all hover:bg-muted focus:ring-2 focus:ring-primary focus:outline-none ${
                  isToday ? "bg-primary text-primary-foreground hover:bg-primary/90 font-bold" : ""
                }`}
              >
                {day}
                {hasNote && (
                  <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-blue-500"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popup / Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Lịch sử hoạt động ngày {selectedDateStr}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDateStr(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>Đang tải dữ liệu...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Classes */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">Lớp học ngày này</h3>
                    {selectedClasses.length === 0 ? (
                      <div className="text-muted-foreground italic bg-muted/20 p-6 rounded-lg text-center border border-dashed">
                        Không có lịch học.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedClasses.map((cls, idx) => (
                          <div key={idx} className="p-3 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-primary">Tiết {cls.startPeriod} - {cls.endPeriod}</span>
                              <Badge variant="outline">{cls.type}</Badge>
                            </div>
                            <h4 className="font-bold mb-1">{cls.courseName}</h4>
                            <div className="text-sm text-muted-foreground">
                              {cls.className} • Phòng {cls.room}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Note */}
                  <div>
                    <MarkdownNote initialContent={noteContent} targetDate={selectedDateStr} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
