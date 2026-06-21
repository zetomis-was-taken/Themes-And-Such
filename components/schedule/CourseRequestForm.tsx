"use client";

import React from "react";
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

interface CourseRequestFormProps {
  requests: CourseRequest[];
  onChange: (requests: CourseRequest[]) => void;
  availableCourseCodes?: string[];
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
              {requests.map((req, index) => (
                <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-bold text-primary">
                    <div className="flex flex-wrap gap-1.5">
                      {req.courseCodes.map(code => (
                        <Badge key={code} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-6">
                      <Slider
                        value={[req.difficulty]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(val) => updateDifficulty(index, val[0])}
                        className="flex-1"
                      />
                      <Badge variant="secondary" className="w-14 justify-center shrink-0 font-medium bg-muted text-foreground">
                        {req.difficulty}/10
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" 
                      onClick={() => removeRequest(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
