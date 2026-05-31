"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRule, updateRule, deleteRule } from "@/lib/grades/actions";

const formSchema = z.object({
  ruleName: z.string().min(1, "Vui lòng nhập tên cột điểm"),
  ruleType: z.enum(["INPUT", "ACCUMULATE"]),
  weightPercent: z.number()
    .min(0, "Trọng số tối thiểu 0%")
    .max(100, "Trọng số tối đa 100%"),
  isQuickInput: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export function RuleFormDialog({
  isOpen,
  setIsOpen,
  classId,
  initialData,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  classId: number;
  initialData?: {
    id: number;
    ruleName: string;
    ruleType: "INPUT" | "ACCUMULATE";
    weightPercent: number;
    isQuickInput: boolean;
  };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ruleName: initialData?.ruleName || "",
      ruleType: initialData?.ruleType || "INPUT",
      weightPercent: initialData?.weightPercent || 0,
      isQuickInput: initialData?.isQuickInput || false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        ruleName: initialData?.ruleName || "",
        ruleType: initialData?.ruleType || "INPUT",
        weightPercent: initialData?.weightPercent || 0,
        isQuickInput: initialData?.isQuickInput || false,
      });
    }
  }, [isOpen, initialData, form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      let res;
      if (initialData) {
        res = await updateRule(initialData.id, {
          ruleName: data.ruleName,
          weightPercent: data.weightPercent,
          isQuickInput: data.isQuickInput,
        });
      } else {
        res = await createRule(classId, data);
      }

      if (res.success) {
        toast.success(initialData ? "Đã cập nhật rule" : "Đã tạo rule");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    setIsDeleting(true);
    try {
      const res = await deleteRule(initialData.id);
      if (res.success) {
        toast.success("Đã xóa rule");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Chỉnh sửa cột điểm" : "Thêm cột điểm mới"}
          </DialogTitle>
          <DialogDescription>
            Tạo cấu trúc tính điểm cho môn học của bạn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ruleName">Tên cột điểm</Label>
            <Input
              id="ruleName"
              placeholder="VD: Điểm giữa kỳ, Chuyên cần..."
              {...form.register("ruleName")}
            />
            {form.formState.errors.ruleName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.ruleName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Loại điểm</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="INPUT"
                  disabled={!!initialData}
                  {...form.register("ruleType")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm">Nhập số (0-10)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ACCUMULATE"
                  disabled={!!initialData}
                  {...form.register("ruleType")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm">Cộng dồn (+/-)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weightPercent">Trọng số (%)</Label>
            <Input
              id="weightPercent"
              type="number"
              placeholder="VD: 30"
              {...form.register("weightPercent", { valueAsNumber: true })}
            />
            {form.formState.errors.weightPercent && (
              <p className="text-sm text-red-500">
                {form.formState.errors.weightPercent.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isQuickInput"
              {...form.register("isQuickInput")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <Label htmlFor="isQuickInput" className="cursor-pointer font-normal">
              Có thể nhập nhanh (Hiển thị ở Dashboard)
            </Label>
          </div>

          <DialogFooter className="pt-4 flex justify-between sm:justify-between w-full">
            {initialData ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading || isDeleting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting}>
                {isLoading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
