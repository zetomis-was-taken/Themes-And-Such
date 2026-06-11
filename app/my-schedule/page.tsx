import React from "react";
import { getOfficialSchedule } from "@/lib/db/schedule/actions";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Image as ImageIcon, Plus } from "lucide-react";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { GeneratedSchedule } from "@/lib/algo/types";

export default async function MySchedulePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth?tab=login");
  }

  const initialSchedule = await getOfficialSchedule();

  const pseudoSchedule: GeneratedSchedule = {
    classes: initialSchedule,
    scores: {
      preferredScore: 0,
      avoidScore: 0,
      balanceScore: 0,
      morningScore: 0,
      afternoonScore: 0,
      leftmostScore: 0,
      rightmostScore: 0,
      totalScore: 0,
    },
    hasViolations: false,
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Lịch Học Của Tôi
          </h1>
          <p className="text-muted-foreground mt-2">
            Thời khoá biểu chính thức cá nhân của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/my-schedule/edit">
            <Button variant="outline" className="shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/20">
              <Edit className="w-4 h-4 mr-2 text-primary" />
              Chỉnh sửa lịch
            </Button>
          </Link>
          <Link href="/my-schedule/export">
            <Button variant="outline" className="shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/20">
              <ImageIcon className="w-4 h-4 mr-2 text-primary" />
              Tùy chỉnh & Xuất Ảnh
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-4 md:p-6 overflow-hidden">
        {initialSchedule.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <ScheduleTable schedule={pseudoSchedule} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-foreground mb-2">Bạn chưa có lịch học nào</h3>
            <p className="text-muted-foreground mb-6">Hãy tự tạo hoặc sử dụng chức năng xếp lịch tự động nhé.</p>
            <div className="flex justify-center gap-4">
              <Link href="/my-schedule/edit">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm môn thủ công
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
