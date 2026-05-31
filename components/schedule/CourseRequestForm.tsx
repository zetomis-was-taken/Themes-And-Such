"use client";

import React, { useState } from "react";
import { CourseRequest } from "@/lib/algo/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface CourseRequestFormProps {
  requests: CourseRequest[];
  onChange: (requests: CourseRequest[]) => void;
  availableCourseCodes: string[];
}

export function CourseRequestForm({ requests, onChange, availableCourseCodes }: CourseRequestFormProps) {
  const [tab, setTab] = useState<"single" | "group">("single");
  const [singleInput, setSingleInput] = useState("");
  const [groupInput, setGroupInput] = useState("");
  const [difficulty, setDifficulty] = useState(5);
  
  const handleAddSingle = () => {
    const val = singleInput.trim().toUpperCase();
    if (!val) return;
    
    if (availableCourseCodes.length > 0 && !availableCourseCodes.includes(val)) {
      toast.error(`Mã môn ${val} không tồn tại trong danh sách lớp mở đã tải lên.`);
      return;
    }
    
    onChange([...requests, {
      courseCodes: [val],
      difficulty: difficulty
    }]);
    
    setSingleInput("");
    setDifficulty(5);
  };

  const handleAddGroup = () => {
    const vals = groupInput.trim().toUpperCase().split(/\s+/).filter(v => v);
    if (vals.length === 0) return;

    const invalidCodes = availableCourseCodes.length > 0 
      ? vals.filter(val => !availableCourseCodes.includes(val))
      : [];

    if (invalidCodes.length > 0) {
      toast.error(`Các mã môn sau không tồn tại: ${invalidCodes.join(", ")}`);
      return;
    }

    // Lọc bỏ mã trùng lặp trong nhóm
    const uniqueVals = Array.from(new Set(vals));

    onChange([...requests, {
      courseCodes: uniqueVals,
      difficulty: difficulty
    }]);

    setGroupInput("");
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
    if (req.courseCodes.length === 1) {
      setTab("single");
      setSingleInput(req.courseCodes[0]);
    } else {
      setTab("group");
      setGroupInput(req.courseCodes.join(" "));
    }
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
          <Tabs value={tab} onValueChange={(val) => setTab(val as "single" | "group")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="single">Môn Đơn</TabsTrigger>
              <TabsTrigger value="group">Nhóm Môn</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
              <div className="space-y-2">
                <Label>Nhập Mã Môn</Label>
                <Input 
                  value={singleInput}
                  onChange={e => setSingleInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSingle(); } }}
                  placeholder="VD: INT2203"
                />
                <p className="text-xs text-muted-foreground">Nhập 1 mã môn duy nhất cần học.</p>
              </div>
              <Button type="button" onClick={handleAddSingle} disabled={!singleInput.trim()} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Thêm Yêu Cầu
              </Button>
            </TabsContent>

            <TabsContent value="group" className="space-y-4">
              <div className="space-y-2">
                <Label>Nhập Nhóm Môn (Cách nhau bằng khoảng trắng)</Label>
                <Input 
                  value={groupInput}
                  onChange={e => setGroupInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddGroup(); } }}
                  placeholder="VD: INT2203 MAT1092"
                />
                <p className="text-xs text-muted-foreground">Nhập nhiều mã môn có thể thay thế nhau. Phân tách bằng phím Space.</p>
              </div>
              {groupInput.trim().split(/\s+/).filter(v => v).length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {Array.from(new Set(groupInput.trim().toUpperCase().split(/\s+/).filter(v => v))).map(code => (
                    <Badge key={code} variant="secondary">{code}</Badge>
                  ))}
                </div>
              )}
              <Button type="button" onClick={handleAddGroup} disabled={!groupInput.trim()} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Thêm Nhóm Môn
              </Button>
            </TabsContent>
          </Tabs>

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
                            <Badge key={code} variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50">
                              {code}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50" onClick={() => editRequest(req.originalIndex)}>
                            <Edit2 className="h-4 w-4" />
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
