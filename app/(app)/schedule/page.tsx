"use client";

import React, { useState } from "react";
import { ClassDataDropzone } from "@/components/schedule/ClassDataDropzone";
import { UploadedClassesTable } from "@/components/schedule/UploadedClassesTable";
import { TimeGrid } from "@/components/schedule/TimeGrid";
import { CourseRequestForm } from "@/components/schedule/CourseRequestForm";
import { ClassData, CourseRequest, GeneratedSchedule } from "@/lib/algo/types";
import {
  WeeklyBitmask,
  createEmptyMask,
  maskToSchedules,
} from "@/lib/algo/bitmask";
import { ScheduleGenerator } from "@/lib/algo/generator";
import { ScheduleViewer } from "@/components/schedule/ScheduleViewer";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import Link from "next/link";

export default function SchedulePage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [preferredMask, setPreferredMask] =
    useState<WeeklyBitmask>(createEmptyMask());
  const [forbiddenMask, setForbiddenMask] =
    useState<WeeklyBitmask>(createEmptyMask());
  const [requests, setRequests] = useState<CourseRequest[]>([]);
  const [results, setResults] = useState<GeneratedSchedule[] | null>(null);
  const [sortBy, setSortBy] = useState<string>("totalScore");
  const [maxResults, setMaxResults] = useState<number>(50);

  const handleGenerate = () => {
    const payload = {
      availableClasses: classes,
      requests,
      constraints: {
        preferredTimes: maskToSchedules(preferredMask),
        forbiddenTimes: maskToSchedules(forbiddenMask),
      },
      maxResults: maxResults,
    };

    const generator = new ScheduleGenerator(payload);
    const generated = generator.generate();

    const sorted = [...generated].sort((a, b) => {
      if (sortBy === "totalScore")
        return b.scores.totalScore - a.scores.totalScore;
      if (sortBy === "balanceScore")
        return b.scores.balanceScore - a.scores.balanceScore;
      if (sortBy === "leftmostScore")
        return b.scores.leftmostScore - a.scores.leftmostScore;
      if (sortBy === "rightmostScore")
        return b.scores.rightmostScore - a.scores.rightmostScore;
      if (sortBy === "morningScore")
        return b.scores.morningScore - a.scores.morningScore;
      if (sortBy === "afternoonScore")
        return b.scores.afternoonScore - a.scores.afternoonScore;
      if (sortBy === "preferredScore")
        return b.scores.preferredScore - a.scores.preferredScore;
      return 0;
    });

    setResults(sorted);
  };

  if (results !== null) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kết quả xếp lịch
          </h1>
          <p className="text-muted-foreground mt-2">
            Thuật toán đã tìm thấy {results.length} lịch học khả thi dựa trên
            yêu cầu của bạn.
          </p>
        </div>
        <ScheduleViewer schedules={results} onBack={() => setResults(null)} />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div className="mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Xếp Lịch Tự Động
          </h1>
          <p className="text-muted-foreground mt-2">
            Tải lên danh sách lớp mở, thiết lập thời gian và nhóm môn học để thuật
            toán xếp lịch tốt nhất cho bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 xl:gap-12">
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h2 className="text-xl font-semibold">Dữ liệu Lớp học</h2>
            </div>
            <ClassDataDropzone onDataLoaded={setClasses} />
            {classes.length > 0 && (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>{" "}
                  Đã nạp {classes.length} lớp học.
                </p>
                <UploadedClassesTable classes={classes} />
              </div>
            )}
          </section>

          <Separator />

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h2 className="text-xl font-semibold">Yêu cầu Môn học</h2>
            </div>
            <CourseRequestForm
              requests={requests}
              onChange={setRequests}
              availableCourseCodes={Array.from(
                new Set(classes.map((c) => c.courseCode)),
              )}
            />
          </section>
        </div>

        <div className="space-y-8 lg:pl-4">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h2 className="text-xl font-semibold">Ràng buộc Thời gian</h2>
            </div>
            <TimeGrid
              preferredMask={preferredMask}
              forbiddenMask={forbiddenMask}
              onChange={(p, f) => {
                setPreferredMask(p);
                setForbiddenMask(f);
              }}
            />
          </section>

          <div className="pt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-semibold">
                  Tiêu chí ưu tiên
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="totalScore">
                    Tổng hợp tốt nhất (Mặc định)
                  </option>
                  <option value="balanceScore">Lịch cân bằng các ngày</option>
                  <option value="morningScore">Dồn lịch sáng</option>
                  <option value="afternoonScore">Dồn lịch chiều</option>
                  <option value="leftmostScore">Dồn lịch đầu tuần</option>
                  <option value="rightmostScore">Dồn lịch cuối tuần</option>
                  <option value="preferredScore">
                    Khớp giờ ưu tiên học nhất
                  </option>
                </select>
              </div>
              <div className="sm:w-48 space-y-1.5">
                <label className="text-sm font-semibold">
                  Số lượng lịch tối đa
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

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
