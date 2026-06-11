import React from "react";
import { getOfficialSchedule } from "@/lib/db/schedule/actions";
import { OfficialScheduleEditor } from "@/components/schedule/OfficialScheduleEditor";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ScheduleEditPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth?tab=login");
  }

  const initialSchedule = await getOfficialSchedule();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Chỉnh sửa lịch chính thức
        </h1>
        <p className="text-muted-foreground mt-2">
          Thêm, xóa hoặc chỉnh sửa các môn học trong lịch chính thức của bạn.
        </p>
      </div>

      <OfficialScheduleEditor initialSchedule={initialSchedule} />
    </div>
  );
}
