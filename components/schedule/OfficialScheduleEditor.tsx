"use client";

import React, { useState, useMemo } from "react";
import {
  SelectedClass,
  ClassData,
  GeneratedSchedule,
  ScheduleTime,
  SubClassData,
} from "@/lib/algo/types";
import { getCourseSemesterHalf } from "@/lib/algo/bitmask";
import { ScheduleTable } from "./ScheduleTable";
import { ClassDataDropzone } from "./ClassDataDropzone";
import { UploadedClassesTable } from "./UploadedClassesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { saveOfficialSchedule } from "@/lib/db/schedule/actions";
import { Loader2, Plus, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";

interface OfficialScheduleEditorProps {
  initialSchedule: SelectedClass[];
}

export function OfficialScheduleEditor({
  initialSchedule,
}: OfficialScheduleEditorProps) {
  const [mySchedule, setMySchedule] =
    useState<SelectedClass[]>(initialSchedule);
  const [jsonClasses, setJsonClasses] = useState<ClassData[]>([]);
  const [searchCourseCode, setSearchCourseCode] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubClassGroup, setSelectedSubClassGroup] =
    useState<string>("");
  const [activeTab, setActiveTab] = useState("json");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      className: "",
      courseCode: "",
      courseName: "",
      credits: 3,
      dayOfWeek: "2",
      startPeriod: "1",
      endPeriod: "3",
      room: "",
      hasSubClass: false,
      subType: "practical",
      subGroupCode: "1",
      subDayOfWeek: "2",
      subStartPeriod: "1",
      subEndPeriod: "3",
      subRoom: "",
    },
  });

  const hasSubClass = watch("hasSubClass");

  const availableClasses = useMemo(() => {
    if (!searchCourseCode.trim()) return [];
    const code = searchCourseCode.toLowerCase().trim();
    return jsonClasses.filter((c) => c.courseCode.toLowerCase().includes(code));
  }, [jsonClasses, searchCourseCode]);

  const selectedClassData = useMemo(() => {
    return (
      availableClasses.find((c) => c.className === selectedClassId) || null
    );
  }, [availableClasses, selectedClassId]);

  const checkTimeConflict = (
    newClass: SelectedClass,
    currentSchedule: SelectedClass[],
    ignoreIndex?: number | null,
  ) => {
    const timesToCheck: ScheduleTime[] = [newClass.classData.schedule];
    if (newClass.selectedSubClass) {
      timesToCheck.push(newClass.selectedSubClass.schedule);
    }

    const half1 = getCourseSemesterHalf(newClass.classData.courseCode);

    for (let i = 0; i < currentSchedule.length; i++) {
      if (
        ignoreIndex !== undefined &&
        ignoreIndex !== null &&
        i === ignoreIndex
      )
        continue;

      const existing = currentSchedule[i];
      const half2 = getCourseSemesterHalf(existing.classData.courseCode);
      
      // If both classes are half-semester but in different halves, they do not conflict
      if (half1 !== "full" && half2 !== "full" && half1 !== half2) {
        continue;
      }

      const existingTimes: ScheduleTime[] = [existing.classData.schedule];
      if (existing.selectedSubClass) {
        existingTimes.push(existing.selectedSubClass.schedule);
      }

      for (const t1 of timesToCheck) {
        for (const t2 of existingTimes) {
          if (t1.dayOfWeek === t2.dayOfWeek) {
            if (
              t1.startPeriod < t2.endPeriod &&
              t1.endPeriod > t2.startPeriod
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const handleAddFromJson = () => {
    if (!selectedClassData) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    if (
      selectedClassData.subClasses &&
      selectedClassData.subClasses.length > 0 &&
      !selectedSubClassGroup
    ) {
      toast.error("Vui lòng chọn nhóm lớp con (TH/BT)");
      return;
    }

    let subClass: SubClassData | undefined;
    if (selectedClassData.subClasses && selectedSubClassGroup) {
      subClass = selectedClassData.subClasses.find(
        (s) => s.groupCode === selectedSubClassGroup,
      );
    }

    const newClass: SelectedClass = {
      classData: selectedClassData,
      selectedSubClass: subClass,
    };

    if (checkTimeConflict(newClass, mySchedule)) {
      toast.error("Lớp này bị trùng thời gian với lịch hiện tại!");
      return;
    }

    const newSchedule = [...mySchedule, newClass];
    setMySchedule(newSchedule);
    
    toast.promise(saveOfficialSchedule(newSchedule), {
      loading: "Đang lưu...",
      success: "Đã thêm lớp học vào lịch",
      error: "Lỗi khi lưu lịch",
    });

    setSelectedClassId("");
    setSelectedSubClassGroup("");
  };

  const handleManualSubmit = (data: any) => {
    const classData: ClassData = {
      className: data.className,
      courseCode: data.courseCode,
      courseName: data.courseName,
      credits: Number(data.credits),
      schedule: {
        dayOfWeek: Number(data.dayOfWeek),
        startPeriod: Number(data.startPeriod),
        endPeriod: Number(data.endPeriod),
        room: data.room,
      },
    };

    let selectedSubClass: SubClassData | undefined = undefined;
    if (data.hasSubClass) {
      selectedSubClass = {
        type: data.subType as any,
        groupCode: data.subGroupCode,
        schedule: {
          dayOfWeek: Number(data.subDayOfWeek),
          startPeriod: Number(data.subStartPeriod),
          endPeriod: Number(data.subEndPeriod),
          room: data.subRoom,
        },
      };
    }

    const newClass: SelectedClass = {
      classData,
      selectedSubClass,
    };

    if (checkTimeConflict(newClass, mySchedule, editingIndex)) {
      toast.error("Lớp này bị trùng thời gian với lịch hiện tại!");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...mySchedule];
      updated[editingIndex] = newClass;
      setMySchedule(updated);
      
      toast.promise(saveOfficialSchedule(updated), {
        loading: "Đang cập nhật...",
        success: "Đã cập nhật lớp học thành công",
        error: "Lỗi khi cập nhật lịch",
      });
      
      setEditingIndex(null);
    } else {
      const updated = [...mySchedule, newClass];
      setMySchedule(updated);
      
      toast.promise(saveOfficialSchedule(updated), {
        loading: "Đang thêm...",
        success: "Đã thêm lớp học thủ công vào lịch",
        error: "Lỗi khi lưu lịch",
      });
    }
    reset();
  };

  const handleEditClass = (index: number) => {
    setEditingIndex(index);
    setActiveTab("manual");
    const target = mySchedule[index];
    const { classData, selectedSubClass } = target;

    setValue("courseCode", classData.courseCode);
    setValue("className", classData.className);
    setValue("courseName", classData.courseName);
    setValue("credits", classData.credits);
    setValue("dayOfWeek", classData.schedule.dayOfWeek.toString());
    setValue("startPeriod", classData.schedule.startPeriod.toString());
    setValue("endPeriod", classData.schedule.endPeriod.toString());
    setValue("room", classData.schedule.room || "");

    if (selectedSubClass) {
      setValue("hasSubClass", true);
      setValue("subType", selectedSubClass.type);
      setValue("subGroupCode", selectedSubClass.groupCode);
      setValue("subDayOfWeek", selectedSubClass.schedule.dayOfWeek.toString());
      setValue(
        "subStartPeriod",
        selectedSubClass.schedule.startPeriod.toString(),
      );
      setValue("subEndPeriod", selectedSubClass.schedule.endPeriod.toString());
      setValue("subRoom", selectedSubClass.schedule.room || "");
    } else {
      setValue("hasSubClass", false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    reset();
  };

  const handleRemoveClass = (index: number) => {
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
    const updated = mySchedule.filter((_, i) => i !== index);
    setMySchedule(updated);
    
    toast.promise(saveOfficialSchedule(updated), {
      loading: "Đang xóa...",
      success: "Đã xóa lớp học",
      error: "Lỗi khi xóa lớp",
    });
  };



  const pseudoSchedule: GeneratedSchedule = {
    classes: mySchedule,
    scores: {
      preferredScore: 0,
      avoidScore: 0,
      balanceScore: 0,
      morningScore: 0,
      afternoonScore: 0,
      leftmostScore: 0,
      rightmostScore: 0,
      totalScore: 0,
    },
    hasViolations: false,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
      <div className="space-y-6 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="json">Từ File JSON</TabsTrigger>
            <TabsTrigger value="manual">Nhập Thủ Công</TabsTrigger>
          </TabsList>

          <TabsContent value="json" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <ClassDataDropzone
                  onDataLoaded={(data) => {
                    setJsonClasses(data);
                    setSearchCourseCode("");
                    setSelectedClassId("");
                    setSelectedSubClassGroup("");
                  }}
                />

                {jsonClasses.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>{" "}
                      Đã nạp {jsonClasses.length} lớp học.
                    </p>
                    <UploadedClassesTable classes={jsonClasses} />
                  </div>
                )}

                {jsonClasses.length > 0 && (
                  <div className="space-y-4 mt-6 border-t pt-6">
                    <div className="space-y-2">
                      <Label>Nhập mã môn học</Label>
                      <Input
                        placeholder="Ví dụ: INT3110"
                        value={searchCourseCode}
                        onChange={(e) => setSearchCourseCode(e.target.value)}
                      />
                    </div>

                    {availableClasses.length > 0 && (
                      <div className="space-y-2">
                        <Label>Chọn lớp học</Label>
                        <Select
                          value={selectedClassId}
                          onValueChange={setSelectedClassId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn lớp..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableClasses.map((c) => (
                              <SelectItem key={c.className} value={c.className}>
                                {c.className} - {c.courseName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedClassData?.subClasses &&
                      selectedClassData.subClasses.length > 0 && (
                        <div className="space-y-2 border-l-2 border-primary pl-4 py-1">
                          <Label>Chọn nhóm thực hành/bài tập</Label>
                          <Select
                            value={selectedSubClassGroup}
                            onValueChange={setSelectedSubClassGroup}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn nhóm thực hành/bài tập..." />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedClassData.subClasses.map((sub) => (
                                <SelectItem
                                  key={sub.groupCode}
                                  value={sub.groupCode}
                                >
                                  Nhóm {sub.groupCode} (
                                  {sub.type === "practical"
                                    ? "Thực hành"
                                    : "Bài tập"}
                                  )
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                    <Button className="w-full" onClick={handleAddFromJson}>
                      <Plus className="w-4 h-4 mr-2" />
                      Kiểm tra & Thêm vào lịch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                <form
                  onSubmit={handleSubmit(handleManualSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Thông tin Lớp chính
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mã môn</Label>
                        <Input
                          required
                          placeholder="INT3110"
                          {...register("courseCode")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tên lớp</Label>
                        <Input
                          required
                          placeholder="INT3110 1"
                          {...register("className")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tên môn học</Label>
                      <Input
                        required
                        placeholder="Phân tích thiết kế hệ thống"
                        {...register("courseName")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Số tín chỉ</Label>
                        <Input
                          type="number"
                          required
                          min="1"
                          max="10"
                          {...register("credits")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Thứ</Label>
                        <Select
                          onValueChange={(val) => setValue("dayOfWeek", val)}
                          defaultValue="2"
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 7].map((d) => (
                              <SelectItem key={d} value={d.toString()}>
                                Thứ {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tiết BĐ</Label>
                        <Input
                          type="number"
                          required
                          min="1"
                          max="15"
                          step="0.5"
                          {...register("startPeriod")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tiết KT</Label>
                        <Input
                          type="number"
                          required
                          min="1"
                          max="15"
                          step="0.5"
                          {...register("endPeriod")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phòng</Label>
                        <Input placeholder="101-G2" {...register("room")} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasSubClass"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        {...register("hasSubClass")}
                      />
                      <Label
                        htmlFor="hasSubClass"
                        className="font-semibold cursor-pointer"
                      >
                        Lớp thực hành/bài tập
                      </Label>
                    </div>

                    {hasSubClass && (
                      <div className="space-y-4 bg-muted/30 p-4 rounded-lg border">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Loại</Label>
                            <Select
                              onValueChange={(val) => setValue("subType", val)}
                              defaultValue="practical"
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="practical">
                                  Thực hành
                                </SelectItem>
                                <SelectItem value="exercise">
                                  Bài tập
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Nhóm</Label>
                            <Input
                              required
                              placeholder="1"
                              {...register("subGroupCode")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Thứ</Label>
                            <Select
                              onValueChange={(val) =>
                                setValue("subDayOfWeek", val)
                              }
                              defaultValue="2"
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[2, 3, 4, 5, 6, 7].map((d) => (
                                  <SelectItem key={d} value={d.toString()}>
                                    Thứ {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Phòng</Label>
                            <Input
                              placeholder="PM1-G3"
                              {...register("subRoom")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Tiết BĐ</Label>
                            <Input
                              type="number"
                              required
                              min="1"
                              max="15"
                              step="0.5"
                              {...register("subStartPeriod")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tiết KT</Label>
                            <Input
                              type="number"
                              required
                              min="1"
                              max="15"
                              step="0.5"
                              {...register("subEndPeriod")}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingIndex !== null ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancelEdit}
                      >
                        Hủy sửa
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Cập nhật
                      </Button>
                    </div>
                  ) : (
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Kiểm tra & Thêm vào lịch
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
          <div>
            <h3 className="font-semibold text-lg">Lịch của bạn</h3>
            <p className="text-sm text-muted-foreground">
              {mySchedule.length} môn học
            </p>
          </div>
        </div>

        {mySchedule.length > 0 ? (
          <ScheduleTable
            schedule={pseudoSchedule}
            onRemoveClass={handleRemoveClass}
            onEditClass={handleEditClass}
            editingIndex={editingIndex}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/10 border-dashed">
            <p className="text-muted-foreground">
              Chưa có môn học nào trong lịch.
            </p>
            <p className="text-sm text-muted-foreground opacity-70">
              Hãy thêm lớp học từ cột bên trái.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
