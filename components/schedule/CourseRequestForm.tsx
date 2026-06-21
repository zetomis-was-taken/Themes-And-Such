"use client";

import React, { useState, useEffect, useRef } from "react";
import { CourseRequest } from "@/lib/algo/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";

interface CourseRequestFormProps {
  requests: CourseRequest[];
  onChange: (requests: CourseRequest[]) => void;
  availableCourseCodes?: string[];
}

// Hàm hỗ trợ đổi màu Badge theo độ khó
function getDifficultyBadgeColor(val: number) {
  if (val < 5) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  if (val <= 7) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800";
}

// Component con xử lý state Slider cục bộ và Animation Layout
const MotionTableRow = motion.tr;

interface RequestRowProps {
  request: CourseRequest;
  onUpdate: (val: number) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

function RequestRow({ request, onUpdate, onRemove, onDragStart, onDrop, onDragEnd }: RequestRowProps) {
  const [localDiff, setLocalDiff] = useState(request.difficulty);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  // Sync state nếu parent array bị thay đổi từ bên ngoài (e.g. xóa dòng khác)
  useEffect(() => {
    setLocalDiff(request.difficulty);
  }, [request.difficulty]);

  return (
    <MotionTableRow 
      layout
      draggable
      onDragStart={(e: any) => {
        // Set visual effect for dragging
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnter={(e: any) => {
        e.preventDefault();
        dragCounter.current++;
        if (dragCounter.current === 1) setIsDragOver(true);
      }}
      onDragOver={(e: any) => {
        e.preventDefault(); // Required to allow drop
      }}
      onDragLeave={(e: any) => {
        dragCounter.current--;
        if (dragCounter.current === 0) setIsDragOver(false);
      }}
      onDrop={(e: any) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragOver(false);
        onDrop();
      }}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-b transition-colors ${isDragOver ? 'bg-primary/5 border-primary/50 outline outline-1 outline-primary' : 'hover:bg-muted/50 data-[state=selected]:bg-muted'}`}
    >
      <TableCell className="align-middle w-10 pl-4 pr-0">
        <div className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted text-muted-foreground/50 hover:text-foreground transition-colors">
          <GripVertical className="h-5 w-5" />
        </div>
      </TableCell>
      <TableCell className="font-bold text-primary align-middle py-3">
        <div className="flex flex-col gap-1.5 items-start">
          {request.courseCodes.length > 1 && (
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Nhóm thay thế:</span>
          )}
          <div className="flex flex-wrap gap-1.5">
            {request.courseCodes.map(code => (
              <Badge key={code} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {code}
              </Badge>
            ))}
          </div>
        </div>
      </TableCell>
      <TableCell className="align-middle">
        <div className="flex items-center gap-6">
          <Slider
            value={[localDiff]}
            min={1}
            max={10}
            step={1}
            onValueChange={(val) => setLocalDiff(val[0])} // Đổi màu badge tức thời, chưa sort
            onValueCommit={(val) => onUpdate(val[0])}     // Nhả chuột mới báo lên cha để sort
            className="flex-1 cursor-grab active:cursor-grabbing"
          />
          <Badge variant="outline" className={`w-14 justify-center shrink-0 font-bold transition-colors duration-300 ${getDifficultyBadgeColor(localDiff)}`}>
            {localDiff}/10
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-center align-middle">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" 
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </MotionTableRow>
  );
}

export function CourseRequestForm({ requests, onChange }: CourseRequestFormProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const removeRequest = (index: number) => {
    const newReqs = [...requests];
    newReqs.splice(index, 1);
    onChange(newReqs);
  };

  const updateDifficulty = (index: number, newDifficulty: number) => {
    const newReqs = [...requests];
    newReqs[index].difficulty = newDifficulty;
    onChange(newReqs);
  };

  const handleDrop = (targetIndex: number) => {
    // Không gộp nếu không có draggedIndex hoặc tự gộp vào chính nó
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const sourceReq = requests[draggedIndex];
    const targetReq = requests[targetIndex];

    // Gộp courseCodes và lọc trùng
    const mergedCourseCodes = Array.from(new Set([...targetReq.courseCodes, ...sourceReq.courseCodes]));

    const newReqs = [...requests];
    
    // Áp dụng "kẻ bị nuốt chửng": Target giữ nguyên độ khó, chỉ mở rộng courseCodes
    newReqs[targetIndex] = {
      ...targetReq,
      courseCodes: mergedCourseCodes
    };
    
    // Xóa source
    newReqs.splice(draggedIndex, 1);
    
    onChange(newReqs);
    setDraggedIndex(null);
  };

  // Sort mảng trước khi map, nhưng cần lưu lại index gốc để gọi hàm remove/update/drop đúng vị trí
  const sortedRequests = requests.map((req, idx) => ({ req, originalIndex: idx }))
                                 .sort((a, b) => b.req.difficulty - a.req.difficulty);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Kéo thả một môn học đè lên môn khác để gộp chúng thành các môn thay thế (hệ thống sẽ tự động xếp 1 trong số các môn trong nhóm).
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-card border rounded-md p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-xl font-bold">+</span>
          </div>
          <h3 className="text-lg font-semibold">Chưa có môn học nào</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Hãy bấm vào biểu tượng dấu cộng <span className="font-bold text-primary">[+]</span> ở bảng "Dữ liệu lớp học" phía trên để đưa môn học vào danh sách yêu cầu.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
          <Table className="table-fixed">
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-[180px] font-semibold text-foreground">Mã Môn</TableHead>
                <TableHead className="font-semibold text-foreground">Mức độ ưu tiên / Độ khó</TableHead>
                <TableHead className="w-[80px] text-center font-semibold text-foreground">Xóa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {sortedRequests.map(({ req, originalIndex }) => (
                  <RequestRow 
                    key={req.courseCodes.join("-")}
                    request={req}
                    onUpdate={(newDiff) => updateDifficulty(originalIndex, newDiff)}
                    onRemove={() => removeRequest(originalIndex)}
                    onDragStart={() => setDraggedIndex(originalIndex)}
                    onDrop={() => handleDrop(originalIndex)}
                    onDragEnd={() => setDraggedIndex(null)}
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
