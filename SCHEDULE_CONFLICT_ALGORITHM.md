# Báo cáo: Thuật toán Thêm lịch học và Kiểm tra trùng lịch

## 1. Mục đích

Tài liệu này mô tả chi tiết luồng hoạt động và logic thuật toán khi người dùng thêm lớp học vào lịch chính thức và hệ thống kiểm tra xem lớp mới có bị trùng thời gian với các lớp hiện có hay không.

## 2. Các thành phần chính

### 2.1 Client-side: `components/schedule/OfficialScheduleEditor.tsx`

**Mục đích**: Giao diện cho phép người dùng thêm hoặc chỉnh sửa lớp học bằng hai cách:
1. Upload JSON từ file
2. Nhập liệu thủ công

**Hàm kiểm tra trùng lịch**

```tsx
const checkTimeConflict = (
  newClass: SelectedClass,
  currentSchedule: SelectedClass[],
  ignoreIndex?: number | null,
) => {
  // Danh sách các thời gian cần kiểm tra từ lớp mới (lớp chính + lớp con nếu có)
  const timesToCheck: ScheduleTime[] = [newClass.classData.schedule];
  if (newClass.selectedSubClass) {
    timesToCheck.push(newClass.selectedSubClass.schedule);
  }

  // Lấy nửa kỳ của lớp mới (full semester, first half, hoặc second half)
  const half1 = getCourseSemesterHalf(newClass.classData.courseCode);

  // Lặp qua từng lớp hiện có trong lịch
  for (let i = 0; i < currentSchedule.length; i++) {
    // Bỏ qua lớp đang chỉnh sửa (nếu là update)
    if (ignoreIndex !== undefined && ignoreIndex !== null && i === ignoreIndex)
      continue;

    const existing = currentSchedule[i];
    const half2 = getCourseSemesterHalf(existing.classData.courseCode);
    
    // Nếu cả hai lớp là half-semester nhưng ở nửa kỳ khác nhau → không trùng
    if (half1 !== "full" && half2 !== "full" && half1 !== half2) {
      continue;
    }

    // Lấy danh sách thời gian từ lớp hiện có (lớp chính + lớp con nếu có)
    const existingTimes: ScheduleTime[] = [existing.classData.schedule];
    if (existing.selectedSubClass) {
      existingTimes.push(existing.selectedSubClass.schedule);
    }

    // Kiểm tra từng cặp thời gian
    for (const t1 of timesToCheck) {
      for (const t2 of existingTimes) {
        // Chỉ xét nếu cùng ngày trong tuần
        if (t1.dayOfWeek === t2.dayOfWeek) {
          // Kiểm tra giao: t1.start < t2.end AND t1.end > t2.start
          if (t1.startPeriod < t2.endPeriod && t1.endPeriod > t2.startPeriod) {
            return true; // Có trùng
          }
        }
      }
    }
  }
  return false; // Không trùng
};
```

**Giải thích chi tiết:**

1. **Lấy danh sách thời gian của lớp mới**: Vì một "lớp" có thể bao gồm lớp chính (lý thuyết) và lớp con (thực hành/bài tập), cần kiểm tra cả hai.

2. **Kiểm tra nửa kỳ**: Một số lớp chỉ dạy trong nửa kỳ đầu hoặc nửa kỳ cuối (ví dụ: kỳ 1 = nửa đầu, kỳ 2 = nửa sau). Nếu hai lớp ở các nửa kỳ khác nhau, không cần kiểm tra trùng.

3. **Kiểm tra giao thời gian (Interval Overlap)**: 
   - Hai khoảng thời gian `[a, b]` và `[c, d]` không giao nếu: `b <= c` hoặc `d <= a`
   - Hai khoảng **giao** nếu: `a < d` AND `b > c` (điều kiện trong code)

### 2.2 Xử lý thêm lớp từ JSON

```tsx
const handleAddFromJson = () => {
  if (!selectedClassData) {
    toast.error("Vui lòng chọn lớp học");
    return;
  }

  // Nếu lớp có lớp con, bắt buộc chọn nhóm
  if (selectedClassData.subClasses && selectedClassData.subClasses.length > 0 && !selectedSubClassGroup) {
    toast.error("Vui lòng chọn nhóm lớp con (TH/BT)");
    return;
  }

  let subClass: SubClassData | undefined;
  if (selectedClassData.subClasses && selectedSubClassGroup) {
    subClass = selectedClassData.subClasses.find(s => s.groupCode === selectedSubClassGroup);
  }

  // Tạo đối tượng lớp mới
  const newClass: SelectedClass = {
    classData: selectedClassData,
    selectedSubClass: subClass,
  };

  // Kiểm tra trùng lịch
  if (checkTimeConflict(newClass, mySchedule)) {
    toast.error("Lớp này bị trùng thời gian với lịch hiện tại!");
    return; // Không cho thêm
  }

  // Thêm vào lịch tạm thời
  const newSchedule = [...mySchedule, newClass];
  setMySchedule(newSchedule);
  
  // Lưu vào database
  toast.promise(saveOfficialSchedule(newSchedule), {
    loading: "Đang lưu...",
    success: "Đã thêm lớp học vào lịch",
    error: "Lỗi khi lưu lịch",
  });

  // Reset các field chọn lớp
  setSelectedClassId("");
  setSelectedSubClassGroup("");
};
```

**Luồng**:
1. Kiểm tra đã chọn lớp chưa
2. Nếu lớp có lớp con, bắt buộc chọn nhóm
3. Tạo đối tượng `SelectedClass`
4. **Gọi `checkTimeConflict`** → Nếu trùng, hiển thị lỗi và dừng
5. Nếu không trùng, cập nhật state `mySchedule` (giao diện cập nhật ngay)
6. Gọi `saveOfficialSchedule()` để lưu vào database

### 2.3 Xử lý nhập liệu thủ công

```tsx
const handleManualSubmit = (data: any) => {
  // Xây dựng đối tượng ClassData từ form
  const classData: ClassData = {
    className: data.className,
    courseCode: data.courseCode,
    courseName: data.courseName,
    credits: Number(data.credits),
    schedule: {
      dayOfWeek: Number(data.dayOfWeek),
      startPeriod: Number(data.startPeriod),
      endPeriod: Number(data.endPeriod),
      room: data.room,
    },
  };

  let selectedSubClass: SubClassData | undefined = undefined;
  if (data.hasSubClass) {
    selectedSubClass = {
      type: data.subType,
      groupCode: data.subGroupCode,
      schedule: {
        dayOfWeek: Number(data.subDayOfWeek),
        startPeriod: Number(data.subStartPeriod),
        endPeriod: Number(data.subEndPeriod),
        room: data.subRoom,
      },
    };
  }

  const newClass: SelectedClass = {
    classData,
    selectedSubClass,
  };

  // Kiểm tra trùng lịch (ignoreIndex dùng khi update lớp đang chỉnh sửa)
  if (checkTimeConflict(newClass, mySchedule, editingIndex)) {
    toast.error("Lớp này bị trùng thời gian với lịch hiện tại!");
    return;
  }

  if (editingIndex !== null) {
    // Chế độ UPDATE
    const updated = [...mySchedule];
    updated[editingIndex] = newClass;
    setMySchedule(updated);
    
    toast.promise(saveOfficialSchedule(updated), {
      loading: "Đang cập nhật...",
      success: "Đã cập nhật lớp học thành công",
      error: "Lỗi khi cập nhật lịch",
    });
    
    setEditingIndex(null);
  } else {
    // Chế độ CREATE (thêm mới)
    const updated = [...mySchedule, newClass];
    setMySchedule(updated);
    
    toast.promise(saveOfficialSchedule(updated), {
      loading: "Đang thêm...",
      success: "Đã thêm lớp học thủ công vào lịch",
      error: "Lỗi khi lưu lịch",
    });
  }
  reset();
};
```

**Điểm quan trọng**:
- Khi chỉnh sửa (update), `ignoreIndex` được truyền vào `checkTimeConflict` để không so sánh lớp hiện tại với chính nó.
- Nếu người dùng chỉ sửa từng chi tiết (ngày, giờ) nhưng không thay đổi giao thời gian, vẫn có thể cập nhật được.

### 2.4 Server-side: `lib/db/schedule/actions.ts`

**Hàm `saveOfficialSchedule()`**

```ts
export async function saveOfficialSchedule(selectedClasses: SelectedClass[]) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.userId;

  // 1. Tạo hoặc lấy ID của các lớp mới
  const incomingIds: { classId: number; subClassId: number | null }[] = [];
  
  for (const selected of selectedClasses) {
    const classId = await getOrCreateClass(selected.classData);
    let subClassId: number | null = null;

    if (selected.selectedSubClass) {
      subClassId = await getOrCreateSubClass(classId, selected.selectedSubClass);
    }
    incomingIds.push({ classId, subClassId });
  }

  // 2. Lấy danh sách lớp hiện có của user
  const existingClasses = await db.query.userClasses.findMany({
    where: eq(userClasses.userId, userId),
  });

  // 3. Tìm các lớp cần xóa (có trong DB nhưng không có trong input mới)
  const toDelete = existingClasses.filter((existing) => {
    return !incomingIds.some(
      (incoming) =>
        incoming.classId === existing.classId &&
        (incoming.subClassId === existing.subClassId || 
        (incoming.subClassId === null && existing.subClassId === null))
    );
  });

  // Xóa từng lớp và rules tương ứng
  for (const del of toDelete) {
    await db.delete(userClasses).where(eq(userClasses.id, del.id));

    // Chỉ xóa rules nếu toàn bộ lớp (tất cả subclass) bị xóa
    const stillHasIncomingForClass = incomingIds.some(
      (c) => c.classId === del.classId
    );
    if (!stillHasIncomingForClass) {
      await db.delete(classRules).where(
        and(
          eq(classRules.userId, userId),
          eq(classRules.classId, del.classId)
        )
      );
    }
  }

  // 4. Tìm các lớp cần thêm (có trong input nhưng không có trong DB)
  const toInsert = incomingIds.filter((incoming) => {
    return !existingClasses.some(
      (existing) =>
        existing.classId === incoming.classId &&
        (existing.subClassId === incoming.subClassId || 
        (incoming.subClassId === null && existing.subClassId === null))
    );
  });

  // Thêm từng lớp vào DB
  for (const ins of toInsert) {
    await db.insert(userClasses).values({
      userId,
      classId: ins.classId,
      subClassId: ins.subClassId ?? undefined,
    });
  }

  return { success: true };
}
```

**Giải thích**:

1. **Kiểm tra quyền**: Chỉ user đã đăng nhập mới có thể lưu lịch.

2. **`getOrCreateClass()` và `getOrCreateSubClass()`**: 
   - Tìm lớp hoặc lớp con trong bảng `classes` và `subClasses`.
   - Nếu tồn tại, dùng ID cũ; nếu không, tạo mới.
   - Nếu lớp đã tồn tại nhưng `credits` khác, cập nhật `credits`.

3. **Đồng bộ dữ liệu**:
   - Lấy danh sách lớp hiện tại của user.
   - So sánh với danh sách mới:
     - **toDelete**: lớp cũ không còn trong danh sách mới → xóa
     - **toInsert**: lớp mới không có trong danh sách cũ → thêm
   - Các lớp không thay đổi giữ nguyên.

4. **Xóa rules**: Khi xóa một lớp hoàn toàn, cũng xóa tất cả rules (cột điểm) của lớp đó. Nhưng nếu lớp chính còn mà chỉ xóa lớp con, rules vẫn giữ lại.

### 2.5 Hàm trợ giúp

```ts
async function getOrCreateSchedule(scheduleData: ScheduleTime) {
  const existing = await db.query.schedules.findFirst({
    where: and(
      eq(schedules.dayOfWeek, String(scheduleData.dayOfWeek)),
      eq(schedules.startPeriod, scheduleData.startPeriod),
      eq(schedules.endPeriod, scheduleData.endPeriod),
      eq(schedules.room, scheduleData.room || ""),
    ),
  });
  if (existing) return existing.id;

  const [newSched] = await db
    .insert(schedules)
    .values({
      dayOfWeek: String(scheduleData.dayOfWeek),
      startPeriod: scheduleData.startPeriod,
      endPeriod: scheduleData.endPeriod,
      room: scheduleData.room || "",
    })
    .returning({ id: schedules.id });
  return newSched.id;
}

async function getOrCreateClass(classData: ClassData) {
  const existing = await db.query.classes.findFirst({
    where: and(
      eq(classes.courseCode, classData.courseCode),
      eq(classes.className, classData.className),
    ),
  });
  
  if (existing) {
    if (existing.credits !== classData.credits) {
      await db.update(classes)
        .set({ credits: classData.credits })
        .where(eq(classes.id, existing.id));
    }
    return existing.id;
  }

  const scheduleId = await getOrCreateSchedule(classData.schedule);

  const [newClass] = await db
    .insert(classes)
    .values({
      className: classData.className,
      courseCode: classData.courseCode,
      courseName: classData.courseName,
      scheduleId: scheduleId,
      credits: classData.credits,
    })
    .returning({ id: classes.id });
  return newClass.id;
}
```

**Logic**:
- `getOrCreateSchedule()`: Kiểm tra xem có schedule với cùng thông tin (ngày, giờ, phòng) hay không. Nếu có, tái sử dụng; nếu không, tạo mới.
- `getOrCreateClass()`: Kiểm tra xem lớp đã tồn tại trong hệ thống hay không. Nếu tồn tại, dùng ID cũ; nếu không, tạo mới cùng schedule.

## 3. Luồng hoàn chỉnh: Thêm lớp học

### Bước 1: Người dùng chọn lớp (hoặc nhập thủ công)
- Từ file JSON hoặc form nhập liệu
- Chọn nhóm lớp con nếu có

### Bước 2: Client kiểm tra trùng lịch
```
checkTimeConflict(newClass, mySchedule)
  ↓
  Nếu trùng → hiển thị lỗi, dừng
  Nếu không trùng → tiếp tục
```

### Bước 3: Cập nhật giao diện
```
setState(mySchedule) 
  ↓ 
Giao diện render ngay lập tức (optimistic update)
```

### Bước 4: Gửi yêu cầu lưu tới server
```
saveOfficialSchedule(newSchedule)
  ↓
  Server thực thi trong transaction:
    1. getOrCreateClass() / getOrCreateSubClass()
    2. So sánh với dữ liệu cũ
    3. Xóa lớp không còn
    4. Thêm lớp mới
```

### Bước 5: Hiển thị kết quả
```
Nếu thành công → toast.success("Đã thêm...")
Nếu lỗi → toast.error("Lỗi khi lưu...")
```

## 4. Các trường hợp đặc biệt

### 4.1 Lớp có lớp con (Practical / Lab)
- Lớp chính là lý thuyết (lecture)
- Lớp con là thực hành/bài tập (practical/lab)
- Cả hai đều được kiểm tra trùng lịch độc lập

### 4.2 Lớp nửa kỳ (Half-semester)
- Một số lớp chỉ dạy nửa kỳ đầu hoặc nửa kỳ cuối
- Hàm `getCourseSemesterHalf()` xác định nửa kỳ dựa vào mã course
- Hai lớp khác nửa kỳ không bao giờ trùng

### 4.3 Chỉnh sửa (Update) lớp đã tồn tại
- Khi edit, `ignoreIndex` được truyền vào `checkTimeConflict`
- Lớp hiện tại không được so sánh với chính nó
- Cho phép thay đổi thời gian nếu không trùng với các lớp khác

### 4.4 Xóa lớp
- Xóa `userClasses` entry
- Chỉ xóa rules nếu toàn bộ lớp bị xóa (cả lớp chính và lớp con)

## 5. Các vấn đề và cải tiến

### 5.1 Kiểm tra trùng lịch chỉ là client-side
- Hiện tại, kiểm tra trùng lịch chỉ được thực hiện trên client.
- **Vấn đề**: Nếu user vô tình tắt JavaScript hoặc thao tác trực tiếp API, vẫn có thể lưu lịch trùng.
- **Đề xuất**: Thêm kiểm tra trùng lịch trên server trước khi lưu vào database.

### 5.2 Không kiểm tra trùng lịch khi upload từ file
- Nếu file JSON chứa nhiều lớp trùng lịch nhau, hệ thống không phát hiện.
- **Đề xuất**: Tính toán tất cả trùng lịch trong file trước khi thêm.

### 5.3 Hiệu suất khi có nhiều lớp
- `checkTimeConflict` có độ phức tạp O(n × m), với n là số lớp hiện có, m là số thời gian của mỗi lớp.
- Nếu user có hơn 20 lớp, việc thêm lớp mới sẽ chậm hơn.
- **Đề xuất**: Tối ưu hóa bằng cách dùng bitmask (như trong `lib/algo/bitmask.ts`) để kiểm tra nhanh hơn.

### 5.4 Không xử lý lỗi mạng
- Nếu lưu database thất bại nhưng UI đã cập nhật, người dùng sẽ thấy dữ liệu không khớp.
- **Đề xuất**: Rollback state nếu `saveOfficialSchedule()` thất bại.

## 6. Pseudo-code

### 6.1 Hàm kiểm tra trùng lịch: `checkTimeConflict()`

```
FUNCTION checkTimeConflict(newClass, currentSchedule, ignoreIndex = null)
  // Bước 1: Lấy danh sách thời gian cần kiểm tra từ lớp mới
  timesToCheck = [newClass.classData.schedule]
  IF newClass.selectedSubClass EXISTS THEN
    timesToCheck.add(newClass.selectedSubClass.schedule)
  END IF
  
  // Bước 2: Lấy nửa kỳ của lớp mới
  half1 = getCourseSemesterHalf(newClass.classData.courseCode)
  
  // Bước 3: Lặp qua từng lớp hiện có trong lịch
  FOR i = 0 TO currentSchedule.length - 1 DO
    // Bỏ qua lớp đang chỉnh sửa (nếu đang update)
    IF ignoreIndex != null AND i == ignoreIndex THEN
      CONTINUE
    END IF
    
    existing = currentSchedule[i]
    half2 = getCourseSemesterHalf(existing.classData.courseCode)
    
    // Nếu cả hai lớp là half-semester nhưng ở nửa kỳ khác nhau → bỏ qua
    IF half1 != "full" AND half2 != "full" AND half1 != half2 THEN
      CONTINUE
    END IF
    
    // Bước 4: Lấy danh sách thời gian từ lớp hiện có
    existingTimes = [existing.classData.schedule]
    IF existing.selectedSubClass EXISTS THEN
      existingTimes.add(existing.selectedSubClass.schedule)
    END IF
    
    // Bước 5: Kiểm tra mỗi cặp thời gian
    FOR EACH t1 IN timesToCheck DO
      FOR EACH t2 IN existingTimes DO
        // Chỉ xét nếu cùng ngày trong tuần
        IF t1.dayOfWeek == t2.dayOfWeek THEN
          // Kiểm tra giao: t1.start < t2.end AND t1.end > t2.start
          IF t1.startPeriod < t2.endPeriod AND t1.endPeriod > t2.startPeriod THEN
            RETURN true  // Có trùng lịch
          END IF
        END IF
      END FOR
    END FOR
  END FOR
  
  RETURN false  // Không có trùng lịch
END FUNCTION
```

**Độ phức tạp**: O(n × m × p) với:
- n = số lớp hiện có
- m = số thời gian mỗi lớp (thường ≤ 2)
- p = số thời gian lớp mới (thường ≤ 2)

### 6.2 Xử lý thêm lớp từ JSON: `handleAddFromJson()`

```
FUNCTION handleAddFromJson()
  // Bước 1: Kiểm tra đã chọn lớp chưa
  IF selectedClassData == null THEN
    showError("Vui lòng chọn lớp học")
    RETURN
  END IF
  
  // Bước 2: Nếu lớp có lớp con, bắt buộc chọn nhóm
  IF selectedClassData.subClasses.length > 0 AND selectedSubClassGroup == "" THEN
    showError("Vui lòng chọn nhóm lớp con (TH/BT)")
    RETURN
  END IF
  
  // Bước 3: Lấy lớp con được chọn
  subClass = null
  IF selectedClassData.subClasses.length > 0 AND selectedSubClassGroup != "" THEN
    subClass = selectedClassData.subClasses.find(s => s.groupCode == selectedSubClassGroup)
  END IF
  
  // Bước 4: Tạo đối tượng lớp mới
  newClass = {
    classData: selectedClassData,
    selectedSubClass: subClass
  }
  
  // Bước 5: Kiểm tra trùng lịch
  IF checkTimeConflict(newClass, mySchedule) THEN
    showError("Lớp này bị trùng thời gian với lịch hiện tại!")
    RETURN
  END IF
  
  // Bước 6: Cập nhật state (UI cập nhật ngay lập tức)
  newSchedule = mySchedule.concat([newClass])
  setMySchedule(newSchedule)
  
  // Bước 7: Lưu vào server
  result = AWAIT saveOfficialSchedule(newSchedule)
  IF result.success THEN
    showSuccess("Đã thêm lớp học vào lịch")
  ELSE
    showError("Lỗi khi lưu lịch")
  END IF
  
  // Bước 8: Reset các field chọn lớp
  setSelectedClassId("")
  setSelectedSubClassGroup("")
END FUNCTION
```

### 6.3 Xử lý nhập liệu thủ công: `handleManualSubmit()`

```
FUNCTION handleManualSubmit(formData)
  // Bước 1: Xây dựng đối tượng ClassData từ form
  classData = {
    className: formData.className,
    courseCode: formData.courseCode,
    courseName: formData.courseName,
    credits: parseInt(formData.credits),
    schedule: {
      dayOfWeek: parseInt(formData.dayOfWeek),
      startPeriod: parseInt(formData.startPeriod),
      endPeriod: parseInt(formData.endPeriod),
      room: formData.room
    }
  }
  
  // Bước 2: Xây dựng đối tượng SubClass nếu có
  selectedSubClass = null
  IF formData.hasSubClass == true THEN
    selectedSubClass = {
      type: formData.subType,
      groupCode: formData.subGroupCode,
      schedule: {
        dayOfWeek: parseInt(formData.subDayOfWeek),
        startPeriod: parseInt(formData.subStartPeriod),
        endPeriod: parseInt(formData.subEndPeriod),
        room: formData.subRoom
      }
    }
  END IF
  
  // Bước 3: Tạo đối tượng lớp mới
  newClass = {
    classData: classData,
    selectedSubClass: selectedSubClass
  }
  
  // Bước 4: Kiểm tra trùng lịch (bỏ qua lớp đang chỉnh sửa nếu có)
  IF checkTimeConflict(newClass, mySchedule, editingIndex) THEN
    showError("Lớp này bị trùng thời gian với lịch hiện tại!")
    RETURN
  END IF
  
  // Bước 5: Xác định là update hay create
  IF editingIndex != null THEN
    // Chế độ UPDATE (chỉnh sửa lớp đã tồn tại)
    updated = mySchedule.copy()
    updated[editingIndex] = newClass
    setMySchedule(updated)
    
    result = AWAIT saveOfficialSchedule(updated)
    IF result.success THEN
      showSuccess("Đã cập nhật lớp học thành công")
      setEditingIndex(null)
    ELSE
      showError("Lỗi khi cập nhật lịch")
    END IF
  ELSE
    // Chế độ CREATE (thêm mới)
    updated = mySchedule.concat([newClass])
    setMySchedule(updated)
    
    result = AWAIT saveOfficialSchedule(updated)
    IF result.success THEN
      showSuccess("Đã thêm lớp học thủ công vào lịch")
    ELSE
      showError("Lỗi khi lưu lịch")
    END IF
  END IF
  
  // Bước 6: Reset form
  resetForm()
END FUNCTION
```

### 6.4 Lưu lịch vào database: `saveOfficialSchedule()`

```
FUNCTION saveOfficialSchedule(selectedClasses)
  // Bước 1: Kiểm tra xác thực
  session = getCurrentSession()
  IF session == null THEN
    THROW Error("Unauthorized")
  END IF
  userId = session.userId
  
  // Bước 2: Tạo hoặc lấy ID của các lớp mới
  incomingIds = []
  FOR EACH selected IN selectedClasses DO
    // Tạo/lấy schedule của lớp chính
    mainScheduleId = getOrCreateSchedule(selected.classData.schedule)
    
    // Tạo/lấy lớp chính
    classId = getOrCreateClass(selected.classData)
    
    // Tạo/lấy lớp con nếu có
    subClassId = null
    IF selected.selectedSubClass != null THEN
      subScheduleId = getOrCreateSchedule(selected.selectedSubClass.schedule)
      subClassId = getOrCreateSubClass(classId, selected.selectedSubClass)
    END IF
    
    incomingIds.add({ classId: classId, subClassId: subClassId })
  END FOR
  
  // Bước 3: Lấy danh sách lớp hiện có của user
  existingClasses = DATABASE.query("SELECT * FROM userClasses WHERE userId = ?", userId)
  
  // Bước 4: Xác định các lớp cần xóa
  toDelete = []
  FOR EACH existing IN existingClasses DO
    found = false
    FOR EACH incoming IN incomingIds DO
      IF existing.classId == incoming.classId AND 
         (existing.subClassId == incoming.subClassId OR 
          (existing.subClassId == null AND incoming.subClassId == null)) THEN
        found = true
        BREAK
      END IF
    END FOR
    IF found == false THEN
      toDelete.add(existing)
    END IF
  END FOR
  
  // Bước 5: Xóa các lớp và rules tương ứng
  FOR EACH del IN toDelete DO
    // Xóa entry từ userClasses
    DATABASE.delete("userClasses", "id = ?", del.id)
    
    // Kiểm tra xem lớp chính còn được sử dụng không
    stillHasIncoming = false
    FOR EACH incoming IN incomingIds DO
      IF incoming.classId == del.classId THEN
        stillHasIncoming = true
        BREAK
      END IF
    END FOR
    
    // Chỉ xóa rules nếu lớp chính hoàn toàn bị xóa
    IF stillHasIncoming == false THEN
      DATABASE.delete("classRules", 
        "userId = ? AND classId = ?", 
        userId, del.classId)
    END IF
  END FOR
  
  // Bước 6: Xác định các lớp cần thêm
  toInsert = []
  FOR EACH incoming IN incomingIds DO
    found = false
    FOR EACH existing IN existingClasses DO
      IF existing.classId == incoming.classId AND 
         (existing.subClassId == incoming.subClassId OR 
          (existing.subClassId == null AND incoming.subClassId == null)) THEN
        found = true
        BREAK
      END IF
    END FOR
    IF found == false THEN
      toInsert.add(incoming)
    END IF
  END FOR
  
  // Bước 7: Thêm các lớp mới
  FOR EACH ins IN toInsert DO
    DATABASE.insert("userClasses", {
      userId: userId,
      classId: ins.classId,
      subClassId: ins.subClassId
    })
  END FOR
  
  RETURN { success: true }
END FUNCTION
```

### 6.5 Hàm trợ giúp: `getOrCreateSchedule()`

```
FUNCTION getOrCreateSchedule(scheduleData)
  // Bước 1: Tìm schedule với cùng thông tin
  existing = DATABASE.findOne("schedules", {
    dayOfWeek: scheduleData.dayOfWeek,
    startPeriod: scheduleData.startPeriod,
    endPeriod: scheduleData.endPeriod,
    room: scheduleData.room OR ""
  })
  
  // Bước 2: Nếu tồn tại, trả về ID
  IF existing != null THEN
    RETURN existing.id
  END IF
  
  // Bước 3: Nếu không tồn tại, tạo mới
  newSched = DATABASE.insert("schedules", {
    dayOfWeek: scheduleData.dayOfWeek,
    startPeriod: scheduleData.startPeriod,
    endPeriod: scheduleData.endPeriod,
    room: scheduleData.room OR ""
  })
  
  RETURN newSched.id
END FUNCTION
```

### 6.6 Hàm trợ giúp: `getOrCreateClass()`

```
FUNCTION getOrCreateClass(classData)
  // Bước 1: Tìm lớp với cùng course code và class name
  existing = DATABASE.findOne("classes", {
    courseCode: classData.courseCode,
    className: classData.className
  })
  
  // Bước 2: Nếu tồn tại
  IF existing != null THEN
    // Cập nhật credits nếu khác
    IF existing.credits != classData.credits THEN
      DATABASE.update("classes", 
        { credits: classData.credits },
        "id = ?", existing.id)
    END IF
    RETURN existing.id
  END IF
  
  // Bước 3: Nếu không tồn tại, tạo mới
  scheduleId = getOrCreateSchedule(classData.schedule)
  
  newClass = DATABASE.insert("classes", {
    className: classData.className,
    courseCode: classData.courseCode,
    courseName: classData.courseName,
    scheduleId: scheduleId,
    credits: classData.credits
  })
  
  RETURN newClass.id
END FUNCTION
```

### 6.7 Hàm trợ giúp: `getOrCreateSubClass()`

```
FUNCTION getOrCreateSubClass(classId, subClassData)
  // Bước 1: Tìm lớp con với cùng class id và group code
  existing = DATABASE.findOne("subClasses", {
    classId: classId,
    groupCode: subClassData.groupCode
  })
  
  // Bước 2: Nếu tồn tại, trả về ID
  IF existing != null THEN
    RETURN existing.id
  END IF
  
  // Bước 3: Nếu không tồn tại, tạo mới
  scheduleId = getOrCreateSchedule(subClassData.schedule)
  
  newSubClass = DATABASE.insert("subClasses", {
    classId: classId,
    groupCode: subClassData.groupCode,
    scheduleId: scheduleId
  })
  
  RETURN newSubClass.id
END FUNCTION
```

## 7. Kết luận

Thuật toán thêm lịch học và kiểm tra trùng lịch bao gồm:

1. **Client-side**: `checkTimeConflict()` kiểm tra khoảng thời gian giao (interval overlap).
2. **Server-side**: `saveOfficialSchedule()` đồng bộ dữ liệu và xử lý transaction.
3. **Đặc biệt**: Hỗ trợ lớp con, nửa kỳ, và chỉnh sửa lớp đã tồn tại.

Để hoàn thiện, cần bổ sung kiểm tra trùng lịch phía server và tối ưu hóa hiệu suất cho lịch lớn.