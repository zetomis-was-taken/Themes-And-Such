import React, { useMemo } from "react";
import { GeneratedSchedule } from "@/lib/algo/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from "next-themes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ScheduleStatisticsProps {
  schedules: GeneratedSchedule[];
}

export function ScheduleStatistics({ schedules }: ScheduleStatisticsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  if (!schedules || schedules.length === 0) return null;

  // Tính toán số liệu thống kê
  const totalSchedules = schedules.length;
  const withViolations = schedules.filter(s => s.hasViolations).length;
  const withoutViolations = totalSchedules - withViolations;
  
  const totalScores = schedules.map(s => s.scores.totalScore);
  const avgScore = totalScores.reduce((a, b) => a + b, 0) / totalSchedules;
  const maxScore = Math.max(...totalScores);
  const minScore = Math.min(...totalScores);

  // Phân bố các ngày đi học trong tuần (Thứ 2 đến Thứ 7)
  const dayCounts = [0, 0, 0, 0, 0, 0]; // Index 0 -> T2, Index 5 -> T7
  schedules.forEach(schedule => {
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

  const daysOfWeek = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  const barData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: 'Số lượng lịch có môn học',
        data: dayCounts,
        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)',
        borderColor: isDark ? 'rgba(59, 130, 246, 1)' : 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: textColor, precision: 0 },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: textColor },
        grid: { display: false },
      }
    },
  };

  const doughnutData = {
    labels: ['Không vi phạm (Tốt)', 'Vi phạm Tránh học (Phạt)'],
    datasets: [
      {
        data: [withoutViolations, withViolations],
        backgroundColor: [
          isDark ? 'rgba(16, 185, 129, 0.8)' : 'rgba(5, 150, 105, 0.8)',
          isDark ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.8)',
        ],
        borderColor: [
          isDark ? '#111827' : '#ffffff',
          isDark ? '#111827' : '#ffffff',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: textColor, padding: 20 },
      },
    },
    cutout: '60%',
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <BarChart2 className="h-4 w-4" /> Xem Thống Kê
        </Button>
      </DialogTrigger>
      {/* Sử dụng sm:max-w-4xl để ghi đè sm:max-w-lg mặc định của shadcn dialog */}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Báo cáo Thống kê Lịch học</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <Card className="bg-gradient-to-br from-card to-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Tổng số lịch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSchedules}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Điểm trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgScore.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-card to-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Cao nhất / Thấp nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <span className="text-green-600 dark:text-green-500">{maxScore}</span>
                <span className="text-muted-foreground text-xl mx-1">/</span>
                <span className="text-red-600 dark:text-red-500">{minScore}</span>
              </div>
            </CardContent>
          </Card>
          <Card className={withViolations > 0 ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800" : "bg-gradient-to-br from-card to-muted/50"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground uppercase font-semibold">Lịch vi phạm tránh học</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${withViolations > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-500"}`}>
                {withViolations} <span className="text-base font-normal text-muted-foreground">lịch</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tần suất học trong tuần</CardTitle>
              <p className="text-sm text-muted-foreground">
                Biểu đồ cột (Bar Chart) thể hiện số lượng lịch học có xếp môn học vào mỗi ngày.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <Bar data={barData} options={barOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chất lượng Lịch</CardTitle>
              <p className="text-sm text-muted-foreground">
                Tỉ lệ lịch hoàn hảo so với lịch vi phạm.
              </p>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              <div className="h-[250px] w-full">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
