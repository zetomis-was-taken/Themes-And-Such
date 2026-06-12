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
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between border-b bg-muted/50">
        <div>
          <CardTitle className="text-lg font-semibold">
            {classData.courseName}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {classData.className} • {classData.credits || 3} Tín chỉ
          </p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <Badge
            variant={totalWeight === 100 ? "default" : "secondary"}
            className={
              totalWeight === 100
                ? "bg-success/20 text-success-foreground hover:bg-success/30 border-transparent dark:bg-success/20 dark:text-success"
                : "bg-warning/20 text-warning-foreground hover:bg-warning/30 border-transparent dark:bg-warning/20 dark:text-warning"
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
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-md border border-dashed border-border">
            <p className="text-sm">Chưa có quy chế điểm nào được thiết lập.</p>
            <p className="text-xs mt-1">Hãy thêm cột điểm để bắt đầu quản lý.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classData.rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedRule(rule);
                  setIsDialogOpen(true);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {rule.ruleName}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {rule.ruleType === "INPUT"
                      ? "Nhập số (0-10)"
                      : "Cộng dồn (+/-)"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">
                    {rule.weightPercent}%
                  </span>
                  <Settings2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
