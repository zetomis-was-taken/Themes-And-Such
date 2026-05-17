import React, { useState } from "react";
import { GeneratedSchedule } from "@/lib/algo/types";
import { ScheduleTable } from "./ScheduleTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Info, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { saveOfficialSchedule } from "@/lib/db/schedule/actions";
import { toast } from "sonner";

interface ScheduleViewerProps {
  schedules: GeneratedSchedule[];
  onBack: () => void;
}

export function ScheduleViewer({ schedules, onBack }: ScheduleViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-gray-50/50">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Cấu hình lại
          </Button>
          <div className="font-medium text-lg">
            Kết quả: <span className="text-primary">{currentIndex + 1}</span> /{" "}
            {schedules.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === schedules.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 text-blue-900 border border-blue-200 p-4 rounded-lg flex flex-col justify-center items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
            Điểm dồn sáng
          </span>
          <span className="text-2xl font-bold">
            {currentSchedule.scores.leftmostScore}
          </span>
        </div>
        <div className="bg-amber-50 text-amber-900 border border-amber-200 p-4 rounded-lg flex flex-col justify-center items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
            Điểm dồn chiều
          </span>
          <span className="text-2xl font-bold">
            {currentSchedule.scores.rightmostScore}
          </span>
        </div>
      </div>

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
