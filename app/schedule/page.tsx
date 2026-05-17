"use client";

import React, { useState } from "react";
import { ClassDataDropzone } from "@/components/schedule/ClassDataDropzone";
import { TimeGrid } from "@/components/schedule/TimeGrid";
import { CourseRequestForm } from "@/components/schedule/CourseRequestForm";
import { ClassData, CourseRequest } from "@/lib/algo/types";
import { WeeklyBitmask, createEmptyMask } from "@/lib/algo/bitmask";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SchedulePage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [preferredMask, setPreferredMask] = useState<WeeklyBitmask>(createEmptyMask());
  const [forbiddenMask, setForbiddenMask] = useState<WeeklyBitmask>(createEmptyMask());
  const [requests, setRequests] = useState<CourseRequest[]>([]);

  const handleGenerate = () => {
    const payload = {
      availableClasses: classes,
      requests,
      constraints: {
        preferredTimes: [], // Will need adaptation to bitmask later
        forbiddenTimes: [], 
      }
    };
    
    console.log("=== THÔNG TIN ĐẦU VÀO ===");
    console.log("Số lượng lớp khả dụng:", classes.length);
    console.log("Yêu cầu môn học:", requests);
    console.log("Preferred Mask:", preferredMask);
    console.log("Forbidden Mask:", forbiddenMask);
    alert("Dữ liệu đã được in ra Console!");
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tìm lịch học</h1>
        <p className="text-muted-foreground mt-2">
          Tải lên danh sách lớp mở, thiết lập thời gian và nhóm môn học để thuật toán xếp lịch tốt nhất cho bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
        {/* Cột trái */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-xl font-semibold">Dữ liệu Lớp học</h2>
            </div>
            <ClassDataDropzone onDataLoaded={setClasses} />
            {classes.length > 0 && (
              <p className="text-sm text-green-600 mt-2 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Đã nạp {classes.length} lớp học.
              </p>
            )}
          </section>

          <Separator />

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="text-xl font-semibold">Yêu cầu Môn học</h2>
            </div>
            <CourseRequestForm requests={requests} onChange={setRequests} />
          </section>
        </div>

        {/* Cột phải */}
        <div className="space-y-8 lg:pl-4">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-xl font-semibold">Ràng buộc Thời gian</h2>
            </div>
            <TimeGrid 
              preferredMask={preferredMask} 
              forbiddenMask={forbiddenMask} 
              onChange={(p, f) => { setPreferredMask(p); setForbiddenMask(f); }} 
            />
          </section>

          <div className="pt-8">
            <Button 
              size="lg" 
              className="w-full text-base h-14 font-semibold shadow-lg hover:shadow-xl transition-all" 
              onClick={handleGenerate}
              disabled={classes.length === 0 || requests.length === 0}
            >
              <Calculator className="mr-2 h-5 w-5" />
              Bắt đầu tạo lịch học
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              * Cần tối thiểu 1 lớp học và 1 yêu cầu môn học để chạy thuật toán.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
