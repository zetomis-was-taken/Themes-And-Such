"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassGradeData } from "@/lib/grades/queries";
import { RuleFormDialog } from "./RuleFormDialog";
import { Plus, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ClassRulesCard({ classData }: { classData: ClassGradeData }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const totalWeight = classData.rules.reduce(
    (acc, rule) => acc + rule.weightPercent,
    0,
  );

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-gray-50/50">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {classData.courseName}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {classData.className} • {classData.credits} Tín chỉ
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <Badge
            variant={totalWeight === 100 ? "default" : "secondary"}
            className={
              totalWeight === 100
                ? "bg-green-100 text-green-700 hover:bg-green-100 border-transparent"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-transparent"
            }
          >
            Tổng: {totalWeight}%
          </Badge>
          <Button
            size="sm"
            onClick={() => {
              setSelectedRule(null);
              setIsDialogOpen(true);
            }}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm cột điểm
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {classData.rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-md border border-dashed">
            <p className="text-sm">Chưa có quy chế điểm nào được thiết lập.</p>
            <p className="text-xs mt-1">Hãy thêm cột điểm để bắt đầu quản lý.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classData.rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-300 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedRule(rule);
                  setIsDialogOpen(true);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {rule.ruleName}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {rule.ruleType === "INPUT"
                      ? "Nhập số (0-10)"
                      : "Cộng dồn (+/-)"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-600">
                    {rule.weightPercent}%
                  </span>
                  <Settings2 className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <RuleFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        classId={classData.classId}
        initialData={selectedRule}
      />
    </Card>
  );
}
