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
  onSelectClass?: (courseCode: string, className: string) => void;
  selectedClassId?: string;
  scheduledCourseCodes?: string[];
  scheduledClassIds?: string[];
}

export function UploadedClassesTable({ classes, onSelectClass, selectedClassId, scheduledCourseCodes = [], scheduledClassIds = [] }: UploadedClassesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("all");
  const [expandedCourseCodes, setExpandedCourseCodes] = useState<Set<string>>(new Set());

  const toggleExpand = (code: string) => {
    setExpandedCourseCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    
    return classes.filter((c) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        c.courseCode.toLowerCase().includes(searchLower) ||
        c.courseName.toLowerCase().includes(searchLower) ||
        c.className.toLowerCase().includes(searchLower);

      const matchDay = filterDay === "all" || c.schedule.dayOfWeek.toString() === filterDay;

      return matchSearch && matchDay;
    });
  }, [classes, searchTerm, filterDay]);

  const groupedClasses = useMemo(() => {
    const groups: { courseCode: string; classes: ClassData[] }[] = [];
    const map = new Map<string, number>();
    
    filteredClasses.forEach((c) => {
      if (map.has(c.courseCode)) {
        groups[map.get(c.courseCode)!].classes.push(c);
      } else {
        map.set(c.courseCode, groups.length);
        groups.push({ courseCode: c.courseCode, classes: [c] });
      }
    });
    return groups;
  }, [filteredClasses]);

  const renderRow = (c: ClassData, idx: number, isGrayedOut: boolean) => {
    const isSelected = selectedClassId === c.className;
    
    const handleClick = () => {
      if (isGrayedOut) return;
      onSelectClass?.(c.courseCode, c.className);
    };

    return (
      <TableRow 
        key={`${c.courseCode}-${c.className}-${idx}`} 
        className={`transition-colors ${isGrayedOut ? 'opacity-50 bg-muted/20' : 'hover:bg-muted/50'} ${onSelectClass && !isGrayedOut ? 'cursor-pointer' : ''} ${isSelected ? 'bg-primary/5' : ''}`}
        onClick={handleClick}
      >
        {onSelectClass && (
          <TableCell>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center mx-auto ${isSelected ? 'border-primary bg-primary' : 'border-primary/50 bg-transparent'} ${isGrayedOut ? 'opacity-50' : ''}`}>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
            </div>
          </TableCell>
        )}
        <TableCell className="font-bold text-primary whitespace-nowrap">
          {c.courseCode}
        </TableCell>
        <TableCell className="font-medium whitespace-normal" title={c.courseName}>
          <div className="line-clamp-2 break-words">
            {c.courseName}
          </div>
        </TableCell>
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
              Tiết <span className="text-primary font-bold">{c.schedule.startPeriod}-{c.schedule.endPeriod}</span>
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
                    <span className="whitespace-nowrap">Tiết <span className="text-primary font-bold">{sc.schedule.startPeriod}-{sc.schedule.endPeriod}</span></span>
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
    );
  };

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

      <div className="rounded-md border bg-card shadow-sm">
        <ScrollArea className="h-[550px] w-full">
          <div className="w-max min-w-full">
            <Table className={`table-fixed ${onSelectClass ? "w-[850px]" : "w-[800px]"}`}>
              <TableHeader className="sticky top-0 bg-secondary z-10 shadow-sm">
                <TableRow>
                  {onSelectClass && (
                    <TableHead className="w-[50px]"></TableHead>
                  )}
                  <TableHead className="font-semibold text-foreground w-[100px]">Mã Môn</TableHead>
                  <TableHead className="font-semibold text-foreground w-[180px]">Tên Môn</TableHead>
                  <TableHead className="font-semibold text-foreground text-center w-[70px]">Tín Chỉ</TableHead>
                  <TableHead className="font-semibold text-foreground w-[90px]">Lớp</TableHead>
                  <TableHead className="font-semibold text-foreground w-[120px]">Lịch Học</TableHead>
                  <TableHead className="font-semibold text-foreground w-[240px]">Thực Hành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedClasses.length > 0 ? (
                  groupedClasses.flatMap((group, groupIdx) => {
                    const isScheduled = scheduledCourseCodes?.includes(group.courseCode);
                    const isExpanded = expandedCourseCodes.has(group.courseCode);

                    if (!isScheduled) {
                      return group.classes.map((c, idx) => renderRow(c, Number(`${groupIdx}${idx}`), false));
                    }

                    const scheduledClassInGroup = group.classes.find(c => scheduledClassIds?.includes(c.className));
                    const otherClasses = group.classes.filter(c => c !== scheduledClassInGroup);

                    const rows = [];
                    if (scheduledClassInGroup) {
                      rows.push(renderRow(scheduledClassInGroup, Number(`${groupIdx}0`), false));
                    } else if (otherClasses.length > 0) {
                      // Fallback in case scheduledClassIds didn't match anything, just show all
                      return group.classes.map((c, idx) => renderRow(c, Number(`${groupIdx}${idx}`), false));
                    }

                    if (otherClasses.length > 0) {
                      if (isExpanded) {
                        otherClasses.forEach((c, idx) => rows.push(renderRow(c, Number(`${groupIdx}${idx + 1}`), true)));
                        rows.push(
                          <TableRow key={`toggle-${group.courseCode}`} className="bg-muted/10 hover:bg-muted/20 cursor-pointer" onClick={() => toggleExpand(group.courseCode)}>
                            <TableCell colSpan={onSelectClass ? 7 : 6} className="text-center py-2 text-xs font-medium text-primary">
                              [-] Thu gọn các lớp cùng mã môn
                            </TableCell>
                          </TableRow>
                        );
                      } else {
                        rows.push(
                          <TableRow key={`toggle-${group.courseCode}`} className="bg-muted/10 hover:bg-muted/20 cursor-pointer" onClick={() => toggleExpand(group.courseCode)}>
                            <TableCell colSpan={onSelectClass ? 7 : 6} className="text-center py-2 text-xs font-medium text-primary">
                              [+] Hiển thị {otherClasses.length} lớp khác cùng mã môn
                            </TableCell>
                          </TableRow>
                        );
                      }
                    }

                    return rows;
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={onSelectClass ? 7 : 6} className="h-24 text-center">
                      Không tìm thấy kết quả nào.
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
