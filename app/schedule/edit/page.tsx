import React from "react";
import { getOfficialSchedule } from "@/lib/db/schedule/actions";
import { OfficialScheduleEditor } from "@/components/schedule/OfficialScheduleEditor";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

export default async function ScheduleEditPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth?tab=login");
  }

  const initialSchedule = await getOfficialSchedule();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Chỉnh sửa lịch chính thức
          </h1>
          <p className="text-muted-foreground mt-2">
            Thêm, xóa hoặc chỉnh sửa các môn học trong lịch chính thức của bạn.
          </p>
        </div>
        <Link href="/schedule/view">
          <Button variant="outline" className="shrink-0 bg-primary/5 hover:bg-primary/10 border-primary/20">
            <ImageIcon className="w-4 h-4 mr-2 text-primary" />
            Tùy chỉnh & Xuất Ảnh
          </Button>
        </Link>
      </div>

      <OfficialScheduleEditor initialSchedule={initialSchedule} />
    </div>
  );
}
