"use client";

import React, { useState } from "react";
import { CourseRequest } from "@/lib/algo/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CourseRequestFormProps {
  requests: CourseRequest[];
  onChange: (requests: CourseRequest[]) => void;
}

export function CourseRequestForm({ requests, onChange }: CourseRequestFormProps) {
  const [courseInput, setCourseInput] = useState("");
  const [currentCodes, setCurrentCodes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState(5);

  const handleAddCode = () => {
    const val = courseInput.trim().toUpperCase();
    if (val && !currentCodes.includes(val)) {
      setCurrentCodes([...currentCodes, val]);
      setCourseInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCode();
    }
  };

  const removeCode = (codeToRemove: string) => {
    setCurrentCodes(currentCodes.filter(c => c !== codeToRemove));
  };

  const addRequest = () => {
    if (currentCodes.length === 0) return;
    
    onChange([...requests, {
      courseCodes: currentCodes,
      difficulty: difficulty
    }]);
    
    setCurrentCodes([]);
    setDifficulty(5);
    setCourseInput("");
  };

  const removeRequest = (index: number) => {
    const newReqs = [...requests];
    newReqs.splice(index, 1);
    onChange(newReqs);
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-3">
            <Label>Thêm Mã Môn (Nhấn Enter để thêm)</Label>
            <div className="flex gap-2">
              <Input 
                value={courseInput}
                onChange={e => setCourseInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="VD: INT2203"
              />
              <Button type="button" onClick={handleAddCode} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {currentCodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentCodes.map(code => (
                  <Badge key={code} variant="default" className="flex items-center gap-1 pl-2 pr-1 py-1">
                    {code}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer hover:text-red-300 opacity-70" 
                      onClick={() => removeCode(code)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              * Bạn có thể thêm nhiều mã môn (vd: CS101, CS102) nếu chúng có thể thay thế nhau trong nhóm này.
            </p>
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

          <Button 
            className="w-full" 
            onClick={addRequest} 
            disabled={currentCodes.length === 0}
          >
            Thêm Yêu Cầu Này
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Danh sách yêu cầu ({requests.length})</h4>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-md border border-dashed text-center">Chưa có môn nào được chọn.</p>
        ) : (
          requests.map((req, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group hover:border-primary/30 transition-colors">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {req.courseCodes.map(code => (
                    <Badge key={code} variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200">
                      {code}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium">Độ khó: {req.difficulty}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRequest(idx)} className="text-destructive opacity-50 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
