"use client";

import { ClassGradeData } from "@/lib/grades/queries";
import { ClassRulesCard } from "./ClassRulesCard";

export function RulesTab({ classesData }: { classesData: ClassGradeData[] }) {
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
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 mb-6">
        <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-1">Hướng dẫn thiết lập</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
          <li>Bạn cần thêm các cột điểm tương ứng với Đề cương chi tiết của môn học.</li>
          <li>Tổng trọng số của các cột điểm trong một môn nên là 100%.</li>
          <li>Có 2 loại điểm: <strong>Nhập số</strong> (thang điểm 10) và <strong>Cộng dồn</strong> (tăng giảm trực tiếp).</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classesData.map((cls) => (
          <ClassRulesCard key={cls.classId} classData={cls} />
        ))}
      </div>
    </div>
  );
}
