/**
 * Seed script – generate mock data cho toàn bộ DB.
 *
 * Chạy:  npm run db:seed
 *
 * Thứ tự insert (tuân theo FK):
 *   users → schedules → classes → subClasses
 *   → userClasses → classRules → inputRecords / accumulateRecords → notes
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import * as schema from "../lib/db/schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rand(min: number, max: number, decimals = 0): number {
  const v = Math.random() * (max - min) + min;
  return decimals === 0 ? Math.floor(v) : parseFloat(v.toFixed(decimals));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Ngày ngẫu nhiên trong học kỳ hiện tại (2026-01 → 2026-05) */
function randomDate(): string {
  const month = String(rand(1, 5)).padStart(2, "0");
  const day = String(rand(1, 28)).padStart(2, "0");
  return `2026-${month}-${day}`;
}

// ---------------------------------------------------------------------------
// Seed Data Definitions
// ---------------------------------------------------------------------------

const USER_DATA = [
  { name: "alice", email: "alice@example.com", password: "password123" },
  { name: "bob", email: "bob@example.com", password: "secret456" },
  { name: "charlie", email: "charlie@example.com", password: "hello789" },
];

const COURSES = [
  { courseCode: "IT001", courseName: "Nhập môn Lập trình", credits: 3 },
  { courseCode: "IT002", courseName: "Cấu trúc Dữ liệu & Giải thuật", credits: 3 },
  { courseCode: "IT003", courseName: "Cơ sở Dữ liệu", credits: 3 },
  { courseCode: "IT004", courseName: "Mạng Máy tính", credits: 3 },
  { courseCode: "IT005", courseName: "Hệ điều hành", credits: 3 },
  { courseCode: "MATH001", courseName: "Giải tích", credits: 4 },
  { courseCode: "MATH002", courseName: "Đại số tuyến tính", credits: 3 },
  { courseCode: "ENG001", courseName: "Tiếng Anh Kỹ thuật", credits: 2 },
];

const CLASS_SUFFIXES = ["01", "02", "03"];

const DAYS = ["2", "3", "4", "5", "6", "7"] as const;
const ROOMS = ["A101", "A202", "B305", "C110", "Lab1", "Lab2"];

const RULE_TEMPLATES: {
  ruleName: string;
  ruleType: "INPUT" | "ACCUMULATE";
  weightPercent: number;
}[] = [
  { ruleName: "Điểm chuyên cần", ruleType: "INPUT", weightPercent: 10 },
  { ruleName: "Điểm giữa kỳ", ruleType: "INPUT", weightPercent: 30 },
  { ruleName: "Điểm cuối kỳ", ruleType: "INPUT", weightPercent: 60 },
];

const RULE_TEMPLATES_ACCUM: {
  ruleName: string;
  ruleType: "INPUT" | "ACCUMULATE";
  weightPercent: number;
}[] = [
  { ruleName: "Bài tập thực hành", ruleType: "ACCUMULATE", weightPercent: 20 },
  { ruleName: "Quiz hàng tuần", ruleType: "ACCUMULATE", weightPercent: 20 },
  { ruleName: "Điểm dự án", ruleType: "INPUT", weightPercent: 30 },
  { ruleName: "Điểm thi cuối kỳ", ruleType: "INPUT", weightPercent: 30 },
];

const NOTE_CONTENTS = [
  "## Ghi chú buổi học\n- Ôn lại chương 3\n- Làm bài tập trang 42-45\n- Nộp báo cáo trước **thứ 6**",
  "## Nhắc nhở\n- Chuẩn bị tài liệu cho buổi thảo luận nhóm\n- Đọc trước slide chương 5",
  "## Tóm tắt lý thuyết\n```\nBFS: O(V+E)\nDFS: O(V+E)\n```\nSẽ thi phần này trong midterm.",
  "## Câu hỏi cần hỏi thầy\n1. Phân biệt deadlock vs starvation?\n2. Giải thích Banker's algorithm",
  "## Deadline sắp tới\n- [ ] Lab 4 nộp 20/05\n- [ ] Báo cáo nhóm nộp 25/05",
];

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Bắt đầu seed mock data...\n");

  // ── 1. USERS ──────────────────────────────────────────────────────────────
  console.log("👤 Tạo users...");
  const insertedUsers = await db
    .insert(schema.users)
    .values(
      await Promise.all(
        USER_DATA.map(async (u) => ({
          name: u.name,
          email: u.email,
          password: await bcrypt.hash(u.password, 10),
        })),
      ),
    )
    .onConflictDoNothing()
    .returning();

  console.log(`   ✔ ${insertedUsers.length} users được tạo`);

  // Lấy tất cả users (kể cả đã tồn tại)
  const allUsers = await db.select().from(schema.users);

  // ── 2. SCHEDULES ──────────────────────────────────────────────────────────
  console.log("📅 Tạo schedules...");
  const scheduleValues = Array.from({ length: 12 }, () => ({
    dayOfWeek: pick(DAYS),
    startPeriod: pick([1, 2, 3, 4, 6, 7, 8]),
    endPeriod: pick([3, 4, 5, 7, 8, 9, 10]),
    room: pick(ROOMS),
  }));

  const insertedSchedules = await db
    .insert(schema.schedules)
    .values(scheduleValues)
    .returning();

  console.log(`   ✔ ${insertedSchedules.length} schedules được tạo`);

  // ── 3. CLASSES ────────────────────────────────────────────────────────────
  console.log("🏫 Tạo classes...");
  const classValues = COURSES.flatMap((course) =>
    CLASS_SUFFIXES.map((suffix) => ({
      className: `${course.courseCode}.${suffix}`,
      courseCode: course.courseCode,
      courseName: course.courseName,
      scheduleId: pick(insertedSchedules).id,
      credits: course.credits,
    })),
  );

  const insertedClasses = await db
    .insert(schema.classes)
    .values(classValues)
    .returning();

  console.log(`   ✔ ${insertedClasses.length} classes được tạo`);

  // ── 4. SUB_CLASSES ────────────────────────────────────────────────────────
  console.log("📚 Tạo sub_classes...");
  const subClassValues = insertedClasses.slice(0, 10).flatMap((cls) =>
    ["TH01", "TH02"].map((group) => ({
      classId: cls.id,
      groupCode: group,
      scheduleId: pick(insertedSchedules).id,
    })),
  );

  const insertedSubClasses = await db
    .insert(schema.subClasses)
    .values(subClassValues)
    .returning();

  console.log(`   ✔ ${insertedSubClasses.length} sub_classes được tạo`);

  // ── 5. USER_CLASSES ───────────────────────────────────────────────────────
  console.log("🔗 Tạo user_classes...");
  // Mỗi user đăng ký 4–6 lớp
  const userClassValues: schema.NewUserClass[] = [];

  for (const user of allUsers) {
    const selectedClasses = insertedClasses
      .sort(() => Math.random() - 0.5)
      .slice(0, rand(4, 6));

    for (const cls of selectedClasses) {
      const relatedSubs = insertedSubClasses.filter(
        (sc) => sc.classId === cls.id,
      );
      userClassValues.push({
        userId: user.id,
        classId: cls.id,
        subClassId: relatedSubs.length > 0 ? pick(relatedSubs).id : null,
      });
    }
  }

  const insertedUserClasses = await db
    .insert(schema.userClasses)
    .values(userClassValues)
    .returning();

  console.log(`   ✔ ${insertedUserClasses.length} user_classes được tạo`);

  // ── 6. CLASS_RULES ────────────────────────────────────────────────────────
  console.log("📋 Tạo class_rules...");
  const classRuleValues: schema.NewClassRule[] = [];

  for (const uc of insertedUserClasses) {
    // Xen kẽ 2 bộ rule templates
    const templates =
      Math.random() > 0.5 ? RULE_TEMPLATES : RULE_TEMPLATES_ACCUM;
    for (const tmpl of templates) {
      classRuleValues.push({
        userId: uc.userId,
        classId: uc.classId,
        ruleName: tmpl.ruleName,
        ruleType: tmpl.ruleType,
        weightPercent: String(tmpl.weightPercent),
      });
    }
  }

  const insertedRules = await db
    .insert(schema.classRules)
    .values(classRuleValues)
    .returning();

  console.log(`   ✔ ${insertedRules.length} class_rules được tạo`);

  // ── 7. INPUT_RECORDS ──────────────────────────────────────────────────────
  console.log("📝 Tạo input_records...");
  const inputRules = insertedRules.filter((r) => r.ruleType === "INPUT");

  const inputRecordValues: schema.NewInputRecord[] = inputRules.map((rule) => ({
    ruleId: rule.id,
    value: String(rand(4, 10, 2)),
  }));

  const insertedInputRecords = await db
    .insert(schema.inputRecords)
    .values(inputRecordValues)
    .returning();

  console.log(`   ✔ ${insertedInputRecords.length} input_records được tạo`);

  // ── 8. ACCUMULATE_RECORDS ─────────────────────────────────────────────────
  console.log("📊 Tạo accumulate_records...");
  const accumRules = insertedRules.filter((r) => r.ruleType === "ACCUMULATE");

  // Mỗi ACCUMULATE rule có 5–10 lần được cộng điểm.
  // Mỗi lần cộng = 1 đơn vị (value = 0 hoặc 1), tổng cộng dồn cuối kỳ.
  const accumRecordValues: schema.NewAccumulateRecord[] = accumRules.flatMap(
    (rule) =>
      Array.from({ length: rand(5, 10) }, () => ({
        ruleId: rule.id,
        value: String(pick([0, 1])), // 0 = không cộng, 1 = được cộng
      })),
  );

  const insertedAccumRecords = await db
    .insert(schema.accumulateRecords)
    .values(accumRecordValues)
    .returning();

  console.log(
    `   ✔ ${insertedAccumRecords.length} accumulate_records được tạo`,
  );

  // ── 9. NOTES ──────────────────────────────────────────────────────────────
  console.log("🗒️  Tạo notes...");
  const noteValues: schema.NewNote[] = [];

  for (const uc of insertedUserClasses.slice(0, 20)) {
    // Mỗi user-class có 2–3 ghi chú
    const count = rand(2, 3);
    const usedDates = new Set<string>();

    for (let i = 0; i < count; i++) {
      let date: string;
      do {
        date = randomDate();
      } while (usedDates.has(date)); // tránh trùng (userId, classId, date)
      usedDates.add(date);

      noteValues.push({
        userId: uc.userId,
        classId: uc.classId,
        targetDate: date,
        content: pick(NOTE_CONTENTS),
      });
    }
  }

  const insertedNotes = await db
    .insert(schema.notes)
    .values(noteValues)
    .returning();

  console.log(`   ✔ ${insertedNotes.length} notes được tạo`);

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log("\n✅ Seed hoàn thành!\n");
  console.log("📊 Thống kê:");
  console.log(`   Users              : ${allUsers.length}`);
  console.log(`   Schedules          : ${insertedSchedules.length}`);
  console.log(`   Classes            : ${insertedClasses.length}`);
  console.log(`   Sub-classes        : ${insertedSubClasses.length}`);
  console.log(`   User-Classes       : ${insertedUserClasses.length}`);
  console.log(`   Class Rules        : ${insertedRules.length}`);
  console.log(`   Input Records      : ${insertedInputRecords.length}`);
  console.log(`   Accumulate Records : ${insertedAccumRecords.length}`);
  console.log(`   Notes              : ${insertedNotes.length}`);
  console.log("\n🔑 Tài khoản test:");
  USER_DATA.forEach((u) =>
    console.log(`   name: ${u.name.padEnd(10)} | password: ${u.password}`),
  );
}

seed().catch((err) => {
  console.error("❌ Seed thất bại:", err);
  process.exit(1);
});
