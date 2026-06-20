import React, { useState, useMemo } from "react";
import { ClassData } from "@/lib/algo/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface UploadedClassesTableProps {
  classes: ClassData[];
}

export function UploadedClassesTable({ classes }: UploadedClassesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("all");

  const groupedCourses = useMemo(() => {
    if (!classes) return [];
    
    // Group classes by courseCode
    const groups: Record<string, { courseCode: string, courseName: string, credits: number, classes: ClassData[] }> = {};
    for (const c of classes) {
      if (!groups[c.courseCode]) {
        groups[c.courseCode] = {
          courseCode: c.courseCode,
          courseName: c.courseName,
          credits: c.credits,
          classes: []
        };
      }
      groups[c.courseCode].classes.push(c);
    }
    
    // Apply filters
    return Object.values(groups).filter((group) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        group.courseCode.toLowerCase().includes(searchLower) ||
        group.courseName.toLowerCase().includes(searchLower) ||
        group.classes.some(c => c.className.toLowerCase().includes(searchLower));

      const matchDay = filterDay === "all" || group.classes.some(c => c.schedule.dayOfWeek.toString() === filterDay);

      return matchSearch && matchDay;
    });
  }, [classes, searchTerm, filterDay]);

  if (!classes || classes.length === 0) return null;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm mã môn, tên môn, lớp..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm font-medium whitespace-nowrap">Lọc theo thứ:</span>
          <Select value={filterDay} onValueChange={setFilterDay}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="2">Thứ 2</SelectItem>
              <SelectItem value="3">Thứ 3</SelectItem>
              <SelectItem value="4">Thứ 4</SelectItem>
              <SelectItem value="5">Thứ 5</SelectItem>
              <SelectItem value="6">Thứ 6</SelectItem>
              <SelectItem value="7">Thứ 7</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm min-w-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="w-full">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-secondary z-10 shadow-sm">
                <TableRow>
                  <TableHead className="font-semibold text-foreground w-[120px]">Mã Môn</TableHead>
                  <TableHead className="font-semibold text-foreground max-w-[250px]">Tên Môn</TableHead>
                  <TableHead className="font-semibold text-foreground text-center w-[80px]">Tín Chỉ</TableHead>
                  <TableHead className="font-semibold text-foreground">Các Lớp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedCourses.length > 0 ? (
                  groupedCourses.map((group, idx) => (
                    <TableRow key={`${group.courseCode}-${idx}`} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-bold text-primary whitespace-nowrap align-top pt-4">
                        {group.courseCode}
                      </TableCell>
                      <TableCell className="font-medium align-top pt-4 max-w-[250px] whitespace-normal break-words">
                        {group.courseName}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-muted-foreground whitespace-nowrap align-top pt-4">{group.credits || 3}</TableCell>
                      <TableCell className="align-top py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {group.classes.map((c, cIdx) => (
                            <HoverCard key={cIdx} openDelay={200} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <Badge variant="outline" className="cursor-default hover:bg-primary/10 transition-colors">
                                  {c.className}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 shadow-lg" side="top" align="start">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-bold text-primary">{c.className}</h4>
                                    <p className="text-sm text-muted-foreground">{c.courseName}</p>
                                  </div>
                                  
                                  <div className="space-y-1.5 border-t pt-2">
                                    <p className="font-semibold text-sm">Lịch học chính:</p>
                                    <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                                      <span>Thứ <span className="font-bold text-amber-600 dark:text-amber-500">{c.schedule.dayOfWeek}</span></span>
                                      <span className="text-muted-foreground">|</span>
                                      <span>Tiết <span className="font-bold text-primary">{c.schedule.startPeriod}-{c.schedule.endPeriod}</span></span>
                                      {c.schedule.room && (
                                        <>
                                          <span className="text-muted-foreground">|</span>
                                          <span>P.{c.schedule.room}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {c.subClasses && c.subClasses.length > 0 && (
                                    <div className="pt-2 border-t space-y-2">
                                      <p className="font-semibold text-sm">Thực hành / Bài tập:</p>
                                      {c.subClasses.map((sc, scIdx) => (
                                        <div key={scIdx} className="bg-muted/50 p-2 rounded text-sm space-y-1">
                                          <p className="font-medium opacity-80">Nhóm {sc.groupCode} - {sc.type === "practical" ? "Thực hành" : "Bài tập"}</p>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span>Thứ <span className="font-bold text-amber-600 dark:text-amber-500">{sc.schedule.dayOfWeek}</span></span>
                                            <span className="text-muted-foreground">|</span>
                                            <span>Tiết <span className="font-bold text-primary">{sc.schedule.startPeriod}-{sc.schedule.endPeriod}</span></span>
                                            {sc.schedule.room && (
                                              <>
                                                <span className="text-muted-foreground">|</span>
                                                <span>P.{sc.schedule.room}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Không tìm thấy môn học nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
