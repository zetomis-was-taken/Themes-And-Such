import React from "react";
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

interface UploadedClassesTableProps {
  classes: ClassData[];
}

export function UploadedClassesTable({ classes }: UploadedClassesTableProps) {
  if (!classes || classes.length === 0) return null;

  return (
    <div className="rounded-md border mt-4 bg-card shadow-sm">
      <ScrollArea className="h-[400px] w-full">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary z-10 shadow-sm">
              <TableRow>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">Mã Môn</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[200px]">Tên Môn</TableHead>
                <TableHead className="font-semibold text-foreground text-center whitespace-nowrap">Tín Chỉ</TableHead>
                <TableHead className="font-semibold text-foreground whitespace-nowrap">Lớp</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[150px]">Lịch Học</TableHead>
                <TableHead className="font-semibold text-foreground min-w-[250px]">Thực Hành</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((c, idx) => (
                <TableRow key={`${c.courseCode}-${c.className}-${idx}`} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-bold text-primary whitespace-nowrap">
                    {c.courseCode}
                  </TableCell>
                  <TableCell className="font-medium">{c.courseName}</TableCell>
                  <TableCell className="text-center font-semibold text-muted-foreground whitespace-nowrap">{c.credits || 3}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline" className="font-medium bg-background">
                      {c.className}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="font-medium">
                        Thứ <span className="text-amber-600 dark:text-amber-500 font-bold">{c.schedule.dayOfWeek}</span>
                      </span>
                      <span className="text-muted-foreground">
                        Tiết <span className="text-blue-600 dark:text-blue-400 font-bold">{c.schedule.startPeriod}-{c.schedule.endPeriod}</span>
                      </span>
                      {c.schedule.room && (
                        <span className="text-xs opacity-70">P.{c.schedule.room}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.subClasses && c.subClasses.length > 0 ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        {c.subClasses.map((sc, scIdx) => (
                          <div key={scIdx} className="text-sm bg-muted/30 p-2 rounded border border-border/50">
                            <span className="font-semibold text-xs uppercase tracking-wider block mb-1 opacity-80">
                              {sc.type === "practical" ? "Thực hành" : "Bài tập"} - Nhóm {sc.groupCode}
                            </span>
                            <div className="flex justify-between items-center gap-4">
                              <span className="whitespace-nowrap">Thứ <span className="text-amber-600 dark:text-amber-500 font-bold">{sc.schedule.dayOfWeek}</span></span>
                              <span className="whitespace-nowrap">Tiết <span className="text-blue-600 dark:text-blue-400 font-bold">{sc.schedule.startPeriod}-{sc.schedule.endPeriod}</span></span>
                            </div>
                            {sc.schedule.room && (
                              <div className="text-xs opacity-70 mt-0.5">P.{sc.schedule.room}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic opacity-70">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
