"use client";

import { ClassGradeData } from "@/lib/grades/queries";
import { GPASummary } from "./GPASummary";
import { ClassGradesCard } from "./ClassGradesCard";

export function GradesTab({ classesData }: { classesData: ClassGradeData[] }) {
  if (classesData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
        <p>Bạn chưa đăng ký môn học nào.</p>
        <p className="text-sm mt-1">
          Vui lòng chọn lịch học chính thức để có dữ liệu môn học.
        </p>
      </div>
    );
  }

  return (
    <div>
      <GPASummary classesData={classesData} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {classesData.map((cls) => (
          <ClassGradesCard key={cls.classId} classData={cls} />
        ))}
      </div>
    </div>
  );
}
