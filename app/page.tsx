import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { ScheduleTable } from "@/components/schedule/ScheduleTable";
import { GeneratedSchedule } from "@/lib/algo/types";
import { ThemeToggle } from "@/components/ThemeToggle";

const DUMMY_SCHEDULE: GeneratedSchedule = {
  classes: [
    {
      classData: {
        className: "MAT1092 1",
        courseCode: "MAT1092",
        courseName: "Đại số",
        credits: 3,
        schedule: {
          dayOfWeek: 2,
          startPeriod: 1,
          endPeriod: 3,
          room: "201-G2",
        },
      },
    },
    {
      classData: {
        className: "PHY1047 3",
        courseCode: "PHY1047",
        courseName: "Vật lý đại cương 1",
        credits: 3,
        schedule: {
          dayOfWeek: 3,
          startPeriod: 4,
          endPeriod: 6,
          room: "302-G3",
        },
      },
      selectedSubClass: {
        type: "practical",
        groupCode: "1",
        schedule: {
          dayOfWeek: 4,
          startPeriod: 7,
          endPeriod: 9,
          room: "PM1-G3",
        },
      },
    },
    {
      classData: {
        className: "INT2204 1",
        courseCode: "INT2204",
        courseName: "Lập trình hướng đối tượng",
        credits: 3,
        schedule: {
          dayOfWeek: 5,
          startPeriod: 7,
          endPeriod: 9,
          room: "301-G2",
        },
      },
    },
    {
      classData: {
        className: "POL1001 2",
        courseCode: "POL1001",
        courseName: "Triết học Mác-Lênin",
        credits: 3,
        schedule: {
          dayOfWeek: 6,
          startPeriod: 1,
          endPeriod: 3,
          room: "101-G2",
        },
      },
    },
  ],
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

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 dark:bg-teal-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 dark:bg-emerald-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          {/* <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" /> */}
          <span className="font-bold text-xl tracking-tight text-teal-600 dark:text-teal-400">
            Portal Helper
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/auth?tab=login">Đăng nhập</Link>
          </Button>
          <Button asChild className="rounded-full px-6">
            <Link href="/dashboard">Bắt đầu ngay</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center pt-12 pb-24 z-10">
        <div className="text-center max-w-3xl space-y-6 mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Xếp Lịch Học <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400">
              Thông Minh Hơn Bao Giờ Hết
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Portal Helper giúp bạn tự động hóa việc xếp lịch, theo dõi điểm số,
            và lên kế hoạch học tập hoàn hảo chỉ với vài cú click chuột.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 gap-2 text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Link href="/dashboard">
                Vào Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-base bg-background/50 backdrop-blur-sm border-teal-500/30 hover:bg-teal-500/10"
            >
              <Link href="/schedule">Thử xếp lịch</Link>
            </Button>
          </div>
        </div>

        {/* Schedule Preview Section */}
        <div className="w-full max-w-5xl rounded-xl border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="border-b bg-muted/50 px-4 py-3 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Lịch Học Của Tôi
            </div>
            <div className="w-12" /> {/* Spacer for balance */}
          </div>
          <div className="p-4 md:p-6 overflow-hidden">
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[800px] pointer-events-none opacity-90">
                <ScheduleTable schedule={DUMMY_SCHEDULE} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 z-10 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Portal Helper. Designed for students.
        </div>
      </footer>
    </div>
  );
}
