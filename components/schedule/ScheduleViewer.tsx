import React, { useState } from "react";
import { GeneratedSchedule } from "@/lib/algo/types";
import { ScheduleTable } from "./ScheduleTable";
import { ScheduleStatistics } from "./ScheduleStatistics";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Info, Loader2, AlertTriangle, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { saveOfficialSchedule } from "@/lib/db/schedule/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ScheduleViewerProps {
  schedules: GeneratedSchedule[];
  onBack: () => void;
}

export function ScheduleViewer({ schedules, onBack }: ScheduleViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30 border-border">
        <Info className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">
          Không tìm thấy lịch học phù hợp
        </h3>
        <p className="text-muted-foreground mb-6">
          Thuật toán không thể tạo ra lịch học nào thoả mãn toàn bộ các yêu cầu
          môn học và ràng buộc thời gian của bạn. Hãy thử nới lỏng các yêu cầu.
        </p>
        <Button onClick={onBack} variant="outline">
          Quay lại cấu hình
        </Button>
      </div>
    );
  }

  const currentSchedule = schedules[currentIndex];
  const { scores, hasViolations } = currentSchedule;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < schedules.length - 1 ? prev + 1 : prev));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveOfficialSchedule(currentSchedule.classes);
      toast.success("Đã lưu lịch học thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi lưu lịch học");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm border-border">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Cấu hình lại
          </Button>
          <div className="font-medium text-lg">
            Kết quả: <span className="text-primary">{currentIndex + 1}</span> /{" "}
            {schedules.length}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ScheduleStatistics schedules={schedules} />
          
          <div className="flex items-center ml-2 gap-1 border rounded-md p-1 bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === schedules.length - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {hasViolations && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold">Cảnh báo: Vi phạm quy tắc "Tránh học"</h4>
            <p className="text-sm opacity-90 mt-1">Lịch học này có xếp một số môn vào khung giờ bạn đã đánh dấu Tránh học (Màu đỏ), do đó bị phạt âm điểm ({scores.avoidScore}).</p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Tổng điểm lịch học
          </h4>
          <span className="text-xl font-bold text-primary">{scores.totalScore}</span>
        </div>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Thời gian</div>
            <div className="flex flex-col gap-1 mt-2">
              <Badge variant="outline" className="justify-between bg-green-50/50 text-green-700 border-green-200">
                <span>Ưu tiên:</span> <span className="font-bold">+{scores.preferredScore}</span>
              </Badge>
              <Badge variant="outline" className="justify-between bg-red-50/50 text-red-700 border-red-200">
                <span>Tránh học:</span> <span className="font-bold">{scores.avoidScore}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Dồn lịch trong ngày</div>
            <div className="flex flex-col gap-1 mt-2">
              <Badge variant="outline" className="justify-between">
                <span>Dồn Sáng:</span> <span className="font-bold">+{scores.morningScore}</span>
              </Badge>
              <Badge variant="outline" className="justify-between">
                <span>Dồn Chiều:</span> <span className="font-bold">+{scores.afternoonScore}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Dồn lịch trong tuần</div>
            <div className="flex flex-col gap-1 mt-2">
              <Badge variant="outline" className="justify-between">
                <span>Dồn Đầu Tuần:</span> <span className="font-bold">+{scores.leftmostScore}</span>
              </Badge>
              <Badge variant="outline" className="justify-between">
                <span>Dồn Cuối Tuần:</span> <span className="font-bold">+{scores.rightmostScore}</span>
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Cân bằng độ khó</div>
            <div className="flex flex-col gap-1 mt-2 h-full justify-center">
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded p-2 border border-blue-100 dark:border-blue-800">
                <div className="text-2xl font-bold">{scores.balanceScore}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-70">Điểm cân bằng</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleTable schedule={currentSchedule} />

      <Separator />

      <div className="flex justify-end pt-2 pb-10">
        <Button 
          onClick={handleSave} 
          size="lg" 
          disabled={isSaving}
          className="px-8 shadow-md hover:shadow-lg transition-all font-semibold"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {isSaving ? "Đang lưu..." : "Lưu làm lịch chính thức"}
        </Button>
      </div>
    </div>
  );
}
