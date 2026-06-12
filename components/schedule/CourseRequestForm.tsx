"use client";

import React, { useState } from "react";
import { CourseRequest } from "@/lib/algo/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface CourseRequestFormProps {
  requests: CourseRequest[];
  onChange: (requests: CourseRequest[]) => void;
  availableCourseCodes: string[];
}

export function CourseRequestForm({ requests, onChange, availableCourseCodes }: CourseRequestFormProps) {
  const [input, setInput] = useState("");
  const [difficulty, setDifficulty] = useState(5);
  
  const handleAddRequest = () => {
    const vals = input.trim().toUpperCase().split(/\s+/).filter(v => v);
    if (vals.length === 0) return;

    const invalidCodes = availableCourseCodes.length > 0 
      ? vals.filter(val => !availableCourseCodes.includes(val))
      : [];

    if (invalidCodes.length > 0) {
      toast.error(`Các mã môn sau không tồn tại: ${invalidCodes.join(", ")}`);
      return;
    }

    // Lọc bỏ mã trùng lặp trong input
    const uniqueVals = Array.from(new Set(vals));

    // Kiểm tra xem mã môn đã tồn tại trong danh sách yêu cầu chưa
    const existingCodes = new Set(requests.flatMap(r => r.courseCodes));
    const duplicateCodes = uniqueVals.filter(val => existingCodes.has(val));

    if (duplicateCodes.length > 0) {
      toast.error(`Các mã môn sau đã có trong danh sách yêu cầu: ${duplicateCodes.join(", ")}`);
      return;
    }

    onChange([...requests, {
      courseCodes: uniqueVals,
      difficulty: difficulty
    }]);

    setInput("");
    setDifficulty(5);
  };

  const removeRequest = (index: number) => {
    const newReqs = [...requests];
    newReqs.splice(index, 1);
    onChange(newReqs);
  };

  const editRequest = (index: number) => {
    const req = requests[index];
    setDifficulty(req.difficulty);
    setInput(req.courseCodes.join(" "));
    // Xoá yêu cầu cũ để thay thế
    removeRequest(index);
    toast.info("Đang chỉnh sửa yêu cầu. Hãy ấn Thêm khi hoàn tất.");
  };

  // Gom nhóm yêu cầu theo độ khó
  const groupedRequests = requests.reduce((acc, req, idx) => {
    const diff = req.difficulty;
    if (!acc[diff]) {
      acc[diff] = [];
    }
    acc[diff].push({ ...req, originalIndex: idx });
    return acc;
  }, {} as Record<number, (CourseRequest & { originalIndex: number })[]>);

  const sortedDifficulties = Object.keys(groupedRequests).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nhập Mã Môn</Label>
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddRequest(); } }}
                placeholder="VD: INT2203 hoặc INT2203 MAT1092"
              />
              <p className="text-xs text-muted-foreground">Nhập 1 mã môn, hoặc nhiều mã môn (cách nhau bởi khoảng trắng) có thể thay thế nhau.</p>
            </div>
            {input.trim().split(/\s+/).filter(v => v).length > 0 && (
              <div className="flex flex-wrap gap-2 py-2">
                {Array.from(new Set(input.trim().toUpperCase().split(/\s+/).filter(v => v))).map(code => (
                  <Badge key={code} variant="secondary">{code}</Badge>
                ))}
              </div>
            )}
            <Button type="button" variant="secondary" onClick={handleAddRequest} disabled={!input.trim()} className="w-full font-medium">
              <Plus className="h-4 w-4 mr-2" /> Thêm Yêu Cầu
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label>Độ khó mong muốn</Label>
              <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded text-primary">{difficulty}/10</span>
            </div>
            <Slider 
              value={[difficulty]} 
              min={1} 
              max={10} 
              step={1} 
              onValueChange={(val) => setDifficulty(val[0])} 
              className="py-2"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Danh sách yêu cầu ({requests.length})
        </h4>
        
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-md border border-dashed border-border text-center">
            Chưa có yêu cầu môn học nào được tạo.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedDifficulties.map(diff => (
              <Card key={diff} className="overflow-hidden border-primary/20">
                <CardHeader className="py-3 px-4 bg-muted/40 border-b">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Mức độ ưu tiên / Độ khó</span>
                    <Badge variant="default" className="bg-primary/90">{diff}/10</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {groupedRequests[diff].map((req, localIdx) => (
                      <div key={localIdx} className="flex items-center justify-between p-3 px-4 hover:bg-muted/20 transition-colors group">
                        <div className="flex flex-wrap gap-1.5">
                          {req.courseCodes.length > 1 && (
                            <span className="text-xs font-semibold mr-1 flex items-center text-muted-foreground">Nhóm:</span>
                          )}
                          {req.courseCodes.map(code => (
                            <Badge key={code} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              {code}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => editRequest(req.originalIndex)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeRequest(req.originalIndex)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
