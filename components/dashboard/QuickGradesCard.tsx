"use client";

import React, { useState } from "react";
import { ClassGradeData } from "@/lib/grades/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  createInputRecord,
  updateInputRecord,
  createAccumulateRecord,
  updateAccumulateRecord,
} from "@/lib/grades/actions";
import { useRouter } from "next/navigation";

function QuickInputCell({
  rule,
}: {
  rule: ClassGradeData["rules"][0];
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(
    rule.inputValue !== null ? String(rule.inputValue) : "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = async () => {
    if (!value) return;
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 10) {
      toast.error("Điểm không hợp lệ (0-10)");
      return;
    }

    if (num === rule.inputValue) return; // No change

    setIsSaving(true);
    try {
      let res;
      if (rule.inputId) {
        res = await updateInputRecord(rule.inputId, num);
      } else {
        res = await createInputRecord(rule.id, num);
      }

      if (!res.success) {
        toast.error(res.error || "Lỗi lưu điểm");
        setValue(rule.inputValue !== null ? String(rule.inputValue) : "");
      } else {
        toast.success(`Đã lưu ${rule.ruleName}`);
        router.refresh();
      }
    } catch (e) {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
      <div className="font-medium text-sm">{rule.ruleName}</div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          disabled={isSaving}
          placeholder="Chưa nhập"
          className="w-24 h-8 text-right text-sm"
        />
      </div>
    </div>
  );
}

function QuickAccumulateCell({
  rule,
}: {
  rule: ClassGradeData["rules"][0];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const currentValue = rule.accumulateValue || 0;

  const handleChange = async (delta: number) => {
    const newValue = currentValue + delta;
    if (newValue < 0) return;

    setIsSaving(true);
    try {
      let res;
      if (rule.accumulateId) {
        res = await updateAccumulateRecord(rule.accumulateId, newValue);
      } else {
        res = await createAccumulateRecord(rule.id, newValue);
      }

      if (!res.success) {
        toast.error(res.error || "Lỗi lưu điểm");
      } else {
        router.refresh();
      }
    } catch (e) {
      toast.error("Đã xảy ra lỗi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
      <div className="font-medium text-sm">{rule.ruleName}</div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={isSaving || currentValue <= 0}
          onClick={() => handleChange(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="w-10 text-center font-semibold text-lg">
          {currentValue}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
          disabled={isSaving}
          onClick={() => handleChange(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function QuickGradesCard({
  classesWithGrades,
}: {
  classesWithGrades: ClassGradeData[];
}) {
  // Filter classes that have at least one quick input rule
  const quickClasses = classesWithGrades
    .map((c) => ({
      ...c,
      rules: c.rules.filter((r) => r.isQuickInput),
    }))
    .filter((c) => c.rules.length > 0);

  if (quickClasses.length === 0) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          Nhập Điểm Nhanh
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        {quickClasses.map((cls) => (
          <div key={cls.classId} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {cls.courseName}
            </h4>
            <div className="bg-card border rounded-lg p-3">
              {cls.rules.map((rule) => (
                <div key={rule.id}>
                  {rule.ruleType === "INPUT" ? (
                    <QuickInputCell rule={rule} />
                  ) : (
                    <QuickAccumulateCell rule={rule} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
