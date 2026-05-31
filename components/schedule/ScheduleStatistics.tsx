import React from "react";
import { GeneratedSchedule } from "@/lib/algo/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScheduleStatisticsProps {
  schedules: GeneratedSchedule[];
}

export function ScheduleStatistics({ schedules }: ScheduleStatisticsProps) {
  if (!schedules || schedules.length === 0) return null;

  // Tính toán số liệu thống kê
  const totalSchedules = schedules.length;
  const withViolations = schedules.filter(s => s.hasViolations).length;
  
  const totalScores = schedules.map(s => s.scores.totalScore);
  const avgScore = totalScores.reduce((a, b) => a + b, 0) / totalSchedules;
  const maxScore = Math.max(...totalScores);
  const minScore = Math.min(...totalScores);

  // Phân bố các ngày đi học trong tuần (Thứ 2 đến Thứ 7)
  const dayCounts = [0, 0, 0, 0, 0, 0]; // Index 0 -> T2, Index 5 -> T7
  schedules.forEach(schedule => {
    // Đếm các ngày có môn học
    const daysWithClasses = new Set<number>();
    schedule.classes.forEach(c => {
      daysWithClasses.add(c.classData.schedule.dayOfWeek - 2);
      if (c.selectedSubClass) {
        daysWithClasses.add(c.selectedSubClass.schedule.dayOfWeek - 2);
      }
    });
    daysWithClasses.forEach(dayIndex => {
      if (dayIndex >= 0 && dayIndex < 6) {
        dayCounts[dayIndex]++;
      }
    });
  });

  const maxDayCount = Math.max(...dayCounts);
  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <BarChart2 className="h-4 w-4" /> Xem Thống Kê
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Thống kê Lịch học tìm được</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">Tổng số lịch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSchedules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">Điểm trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{avgScore.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">Cao nhất / Thấp nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className="text-green-600">{maxScore}</span>
                <span className="text-muted-foreground text-lg mx-1">/</span>
                <span className="text-red-600">{minScore}</span>
              </div>
            </CardContent>
          </Card>
          <Card className={withViolations > 0 ? "border-red-200 bg-red-50 dark:bg-red-900/10" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase">Có vi phạm tránh học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${withViolations > 0 ? "text-red-600" : "text-green-600"}`}>
                {withViolations} <span className="text-sm font-normal text-muted-foreground">lịch</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="font-semibold text-lg mt-6 mb-4">Tần suất học trong tuần</h3>
        <p className="text-sm text-muted-foreground mb-4">Biểu đồ thể hiện số lượng lịch học (trong tổng số {totalSchedules} lịch) có xếp môn học vào ngày tương ứng.</p>
        
        <div className="space-y-4">
          {dayCounts.map((count, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-16 font-medium text-sm">{daysOfWeek[idx]}</div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${count === maxDayCount ? "bg-primary" : "bg-primary/50"}`} 
                  style={{ width: `${maxDayCount > 0 ? (count / maxDayCount) * 100 : 0}%` }}
                />
              </div>
              <div className="w-12 text-sm text-right font-medium">{count}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
