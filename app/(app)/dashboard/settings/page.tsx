"use client";

import { useState, useTransition, useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/auth/atom";
import { updateName, sendPasswordChangeOtp, verifyAndChangePassword } from "@/lib/auth/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, MailWarning } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();

  // Name Form State
  const [name, setName] = useState("");
  const [isPendingName, startTransitionName] = useTransition();

  // Password Form State
  const [passwordStep, setPasswordStep] = useState<"initial" | "otp">("initial");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPendingPassword, startTransitionPassword] = useTransition();

  // Initialize name
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên hiển thị không được để trống.");
      return;
    }
    if (name === user?.name) {
      toast.info("Tên hiển thị không thay đổi.");
      return;
    }

    startTransitionName(async () => {
      const res = await updateName(name);
      if (res.success) {
        if (user) {
          setUser({ ...user, name });
        }
        toast.success("Cập nhật tên hiển thị thành công.");
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra khi đổi tên.");
      }
    });
  };

  const handleRequestOtp = () => {
    startTransitionPassword(async () => {
      const res = await sendPasswordChangeOtp();
      if (res.success && res.email) {
        // Mask the email for privacy (e.g. z***m@gmail.com)
        const parts = res.email.split("@");
        const masked = parts[0].charAt(0) + "***" + parts[0].slice(-1) + "@" + parts[1];
        setMaskedEmail(masked);
        setPasswordStep("otp");
        toast.success("Mã OTP đã được gửi đến email của bạn.");
      } else {
        toast.error(res.error || "Không thể gửi mã OTP.");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Vui lòng nhập mã OTP.");
      return;
    }
    if (!newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    startTransitionPassword(async () => {
      const res = await verifyAndChangePassword(otp, newPassword);
      if (res.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordStep("initial");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Mã OTP không hợp lệ.");
      }
    });
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Cài đặt Tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Hồ sơ cá nhân</CardTitle>
            <CardDescription>Cập nhật tên hiển thị của bạn trên hệ thống.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Tên hiển thị</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPendingName}
                />
              </div>
              <Button type="submit" disabled={isPendingName || name === user?.name}>
                {isPendingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bảo mật</CardTitle>
            <CardDescription>
              Đổi mật khẩu tài khoản. Việc này yêu cầu xác thực qua email để đảm bảo an toàn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordStep === "initial" ? (
              <div className="flex flex-col items-start gap-4">
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-md border border-amber-200 dark:border-amber-900 w-full">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    Để thay đổi mật khẩu, chúng tôi sẽ gửi một mã xác thực (OTP) đến email đã liên kết với tài khoản này.
                  </p>
                </div>
                <Button onClick={handleRequestOtp} disabled={isPendingPassword}>
                  {isPendingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yêu cầu đổi mật khẩu
                </Button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 rounded-md border border-teal-200 dark:border-teal-900">
                  <MailWarning className="h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    Mã OTP 8 số đã được gửi đến email <strong>{maskedEmail}</strong>. Mã có hiệu lực trong 5 phút.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="otp">Mã xác thực (OTP)</Label>
                  <Input
                    id="otp"
                    placeholder="••••••••"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={8}
                    className="tracking-[0.5em] font-mono text-lg"
                    disabled={isPendingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPendingPassword}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPendingPassword}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isPendingPassword}>
                    {isPendingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lưu mật khẩu mới
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPasswordStep("initial");
                      setOtp("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={isPendingPassword}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
