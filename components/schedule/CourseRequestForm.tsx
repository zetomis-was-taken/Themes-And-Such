"use client";

import React, { useState, useEffect } from "react";
import { CourseRequest } from "@/lib/algo/types";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
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

function RequestRow({ request, onUpdate, onRemove }: { request: CourseRequest, onUpdate: (val: number) => void, onRemove: () => void }) {
  const [localDiff, setLocalDiff] = useState(request.difficulty);

  // Sync state nếu parent array bị thay đổi từ bên ngoài (e.g. xóa dòng khác)
  useEffect(() => {
    setLocalDiff(request.difficulty);
  }, [request.difficulty]);

  return (
    <MotionTableRow 
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <TableCell className="font-bold text-primary align-middle">
        <div className="flex flex-wrap gap-1.5">
          {request.courseCodes.map(code => (
            <Badge key={code} variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {code}
            </Badge>
          ))}
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

  // Sort mảng trước khi map, nhưng cần lưu lại index gốc để gọi hàm remove/update đúng vị trí
  const sortedRequests = requests.map((req, idx) => ({ req, originalIndex: idx }))
                                 .sort((a, b) => b.req.difficulty - a.req.difficulty);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Danh sách yêu cầu ({requests.length})
        </h4>
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
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
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
