import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserClassesWithGrades } from "@/lib/grades/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RulesTab } from "@/components/grades/rules/RulesTab";
import { GradesTab } from "@/components/grades/entry/GradesTab";

export const metadata = {
  title: "Quản lý điểm | Portal Helper",
};

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/auth?tab=login");
  }

  const resolvedParams = await searchParams;
  const tab =
    typeof resolvedParams.tab === "string" ? resolvedParams.tab : "entry";

  const classesData = await getUserClassesWithGrades();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Quản lý Điểm & GPA
        </h1>
        <p className="text-muted-foreground mt-2">
          Theo dõi và tính toán điểm số cho các môn học của bạn.
        </p>
      </div>

      <Tabs key={tab} defaultValue={tab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
          <TabsTrigger value="entry">Nhập điểm</TabsTrigger>
          <TabsTrigger value="rules">Thiết lập Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="mt-0">
          <GradesTab classesData={classesData} />
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <RulesTab classesData={classesData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
