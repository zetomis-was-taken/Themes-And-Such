"use client";

import { ClassGradeData } from "@/lib/grades/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputRuleItem } from "./InputRuleItem";
import { AccumulateRuleItem } from "./AccumulateRuleItem";
import { Badge } from "@/components/ui/badge";

export function ClassGradesCard({ classData }: { classData: ClassGradeData }) {
  // Calculate current score for this class
  const calculateClassScore = () => {
    let totalScore = 0;
    let totalWeightUsed = 0;

    for (const rule of classData.rules) {
      let ruleScore = 0;
      if (rule.ruleType === "INPUT") {
        ruleScore = rule.inputValue || 0;
      } else {
        ruleScore = rule.accumulateValue || 0;
        // Optionally cap accumulate score at 10
        if (ruleScore > 10) ruleScore = 10;
      }

      totalScore += ruleScore * (rule.weightPercent / 100);
      totalWeightUsed += rule.weightPercent;
    }

    return {
      score: totalScore,
      weightUsed: totalWeightUsed,
      maxPossible: 10,
    };
  };

  const { score, weightUsed } = calculateClassScore();

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
        <div className="text-right">
          <Badge
            variant={weightUsed === 100 ? "default" : "outline"}
            className={
              weightUsed === 100
                ? "bg-green-100 text-green-700 hover:bg-green-100 border-transparent text-sm py-1 px-3"
                : "text-sm py-1 px-3"
            }
          >
            Tổng: {score.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {classData.rules.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground bg-gray-50 rounded-md border border-dashed">
            <p className="text-sm">Chưa có cột điểm.</p>
            <p className="text-xs mt-1">Sang tab Thiết lập Rules để thêm.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classData.rules.map((rule) =>
              rule.ruleType === "INPUT" ? (
                <InputRuleItem key={rule.id} rule={rule} />
              ) : (
                <AccumulateRuleItem key={rule.id} rule={rule} />
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
