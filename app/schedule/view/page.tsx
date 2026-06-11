import React from "react";
import { getOfficialSchedule } from "@/lib/db/schedule/actions";
import { ExportScheduleEditor } from "@/components/schedule/ExportScheduleEditor";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ScheduleViewPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth?tab=login");
  }

  const initialSchedule = await getOfficialSchedule();

  return (
    <div className="container max-w-[1600px] mx-auto py-8 px-4 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tùy chỉnh & Xuất Lịch
        </h1>
        <p className="text-muted-foreground mt-2">
          Cá nhân hóa lịch học của bạn và xuất ra hình ảnh chất lượng cao.
        </p>
      </div>

      <ExportScheduleEditor initialSchedule={initialSchedule} />
    </div>
  );
}
