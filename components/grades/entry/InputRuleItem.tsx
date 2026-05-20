"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { createInputRecord, updateInputRecord } from "@/lib/grades/actions";

export function InputRuleItem({
  rule,
}: {
  rule: {
    id: number;
    ruleName: string;
    weightPercent: number;
    inputValue: number | null;
    inputId: number | null;
  };
}) {
  const router = useRouter();
  const [value, setValue] = useState(
    rule.inputValue !== null ? String(rule.inputValue) : "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 10) {
      toast.error("Điểm phải là số từ 0 đến 10");
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (rule.inputId) {
        res = await updateInputRecord(rule.inputId, numValue);
      } else {
        res = await createInputRecord(rule.id, numValue);
      }

      if (res.success) {
        toast.success("Đã lưu điểm");
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{rule.ruleName}</span>
        <span className="text-xs text-muted-foreground mt-0.5">
          Trọng số: {rule.weightPercent}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0-10"
          className="w-20 text-center h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
        />
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9"
          onClick={handleSave}
          disabled={
            isLoading ||
            value === "" ||
            (rule.inputValue !== null && parseFloat(value) === rule.inputValue)
          }
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-green-600" />
          )}
        </Button>
      </div>
    </div>
  );
}
