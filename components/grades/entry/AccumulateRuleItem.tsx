"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import {
  createAccumulateRecord,
  updateAccumulateRecord,
} from "@/lib/grades/actions";

export function AccumulateRuleItem({
  rule,
}: {
  rule: {
    id: number;
    ruleName: string;
    weightPercent: number;
    accumulateValue: number | null;
    accumulateId: number | null;
  };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (delta: number) => {
    const currentValue = rule.accumulateValue || 0;
    const newValue = currentValue + delta;

    if (newValue < 0) return;

    setIsLoading(true);
    try {
      let res;
      if (rule.accumulateId) {
        res = await updateAccumulateRecord(rule.accumulateId, newValue);
      } else {
        res = await createAccumulateRecord(rule.id, newValue);
      }

      if (res.success) {
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
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{rule.ruleName}</span>
        <span className="text-xs text-muted-foreground mt-0.5">
          Trọng số: {rule.weightPercent}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleUpdate(-1)}
          disabled={isLoading || !rule.accumulateValue || rule.accumulateValue <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-semibold text-lg">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            rule.accumulateValue || 0
          )}
        </span>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleUpdate(1)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
