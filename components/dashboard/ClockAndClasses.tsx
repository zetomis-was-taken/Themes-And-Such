"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, MapPin, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClassItem {
  courseName: string;
  className: string;
  room: string;
  startPeriod: number;
  endPeriod: number;
  dayOfWeek: string;
  type: string;
}

const PERIOD_TIMES = [
  { start: "07:00", end: "07:50" }, // 1
  { start: "08:00", end: "08:50" }, // 2
  { start: "09:00", end: "09:50" }, // 3
  { start: "10:00", end: "10:50" }, // 4
  { start: "11:00", end: "11:50" }, // 5
  { start: "13:00", end: "13:50" }, // 6
  { start: "14:00", end: "14:50" }, // 7
  { start: "15:00", end: "15:50" }, // 8
  { start: "16:00", end: "16:50" }, // 9
  { start: "17:00", end: "17:50" }, // 10
  { start: "18:00", end: "18:50" }, // 11
  { start: "19:00", end: "19:50" }, // 12
];

function timeToMinutes(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function ClockAndClasses({ allClasses }: { allClasses: ClassItem[] }) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentTime) return null; // Hydration fix

  const jsDay = currentTime.getDay();
  const currentDayOfWeek = jsDay === 0 ? "8" : String(jsDay + 1);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const todaysClasses = allClasses
    .filter((c) => c.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startPeriod - b.startPeriod);

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-primary-foreground shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground/80 font-medium mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Thứ {currentDayOfWeek === "8" ? "Chủ Nhật" : currentDayOfWeek}, {currentTime.toLocaleDateString("vi-VN")}
            </p>
            <h2 className="text-4xl font-bold tracking-tight">
              {currentTime.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
          </div>
          <div className="hidden sm:block opacity-20">
            <Clock className="w-20 h-20" />
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-bold mb-4">Lớp học hôm nay</h3>
        {todaysClasses.length === 0 ? (
          <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground bg-muted/20">
            Hôm nay bạn không có lịch học nào. Tuyệt vời!
          </div>
        ) : (
          <div className="space-y-3">
            {todaysClasses.map((cls, idx) => {
              const startIdx = Math.max(0, Math.floor(cls.startPeriod) - 1);
              const endIdx = Math.min(11, Math.ceil(cls.endPeriod) - 1);
              
              const startTimeStr = PERIOD_TIMES[startIdx]?.start || "00:00";
              const endTimeStr = PERIOD_TIMES[endIdx]?.end || "23:59";
              
              const startMin = timeToMinutes(startTimeStr);
              const endMin = timeToMinutes(endTimeStr);
              
              const isActive = currentMinutes >= startMin && currentMinutes <= endMin;
              const isPast = currentMinutes > endMin;

              return (
                <div 
                  key={idx} 
                  className={`p-4 border rounded-lg transition-all ${
                    isActive 
                      ? "bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-400" 
                      : isPast 
                        ? "bg-muted/30 opacity-70" 
                        : "bg-white hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 items-center">
                      <span className="font-semibold text-lg">{startTimeStr} - {endTimeStr}</span>
                      {isActive && <Badge variant="default" className="bg-blue-600">Đang diễn ra</Badge>}
                      {isPast && <Badge variant="secondary">Đã kết thúc</Badge>}
                    </div>
                    <Badge variant="outline">{cls.type}</Badge>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-1">{cls.courseName}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" /> {cls.className}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {cls.room}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Tiết {cls.startPeriod} - {cls.endPeriod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
