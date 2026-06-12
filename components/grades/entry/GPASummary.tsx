"use client";

import { ClassGradeData } from "@/lib/grades/queries";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Award, BookOpen } from "lucide-react";

export function GPASummary({ classesData }: { classesData: ClassGradeData[] }) {
  // Tính tổng số tín chỉ của toàn bộ lịch học
  const scheduleTotalCredits = classesData.reduce((acc, cls) => acc + (cls.credits || 3), 0);

  // Tính tổng số tín chỉ và điểm GPA (chỉ tính môn đã có điểm)
  let totalCredits = 0;
  let totalScoreCredits = 0;

  let classesWithGrades = 0;

  for (const cls of classesData) {
    if (cls.rules.length === 0) continue;

    let classScore = 0;
    let hasAnyGrade = false;

    for (const rule of cls.rules) {
      if (rule.ruleType === "INPUT" && rule.inputValue !== null) {
        classScore += rule.inputValue * (rule.weightPercent / 100);
        hasAnyGrade = true;
      } else if (
        rule.ruleType === "ACCUMULATE" &&
        rule.accumulateValue !== null
      ) {
        let val = rule.accumulateValue;
        if (val > 10) val = 10;
        classScore += val * (rule.weightPercent / 100);
        hasAnyGrade = true;
      }
    }

    if (hasAnyGrade) {
      const clsCredits = cls.credits || 3;
      totalCredits += clsCredits;
      totalScoreCredits += classScore * clsCredits;
      classesWithGrades++;
    }
  }

  const gpa10 = totalCredits > 0 ? totalScoreCredits / totalCredits : 0;
  
  // Tính hệ 4 tương đương (có thể dùng công thức cơ bản hoặc map theo quy định)
  const gpa4 = (gpa10 / 10) * 4;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md border-0">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-primary-foreground/80 font-medium">GPA Hệ 10</p>
            <h2 className="text-3xl font-bold">{gpa10.toFixed(2)}</h2>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md border-0">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-teal-50 font-medium">GPA Hệ 4</p>
            <h2 className="text-3xl font-bold">{gpa4.toFixed(2)}</h2>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-muted-foreground font-medium text-sm">
              Tổng số tín chỉ
            </p>
            <h2 className="text-3xl font-bold text-foreground">
              {scheduleTotalCredits}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Toàn bộ {classesData.length} môn học
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
