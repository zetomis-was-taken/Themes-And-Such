"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/auth/atom";
import { login, sendRegistrationOtp, verifyRegistrationOtp } from "@/lib/auth/actions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AuthTabs({
  defaultTab,
}: {
  defaultTab: "login" | "register";
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [_, setUser] = useAtom(userAtom);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActiveTab(defaultTab);
    setError("");
    setRegisterStep("form");
  }, [defaultTab]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    startTransition(async () => {
      const res = await login(username, password);

      if (res.success) {
        setUser(res.user);
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Có lỗi xảy ra");
      }
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (registerStep === "form") {
      if (!username || !password || !email) {
        setError("Vui lòng điền đầy đủ thông tin.");
        return;
      }

      startTransition(async () => {
        const res = await sendRegistrationOtp(username, email);
        if (res.success) {
          setRegisterStep("otp");
        } else {
          setError(res.error || "Có lỗi xảy ra");
        }
      });
    } else {
      if (!otp) {
        setError("Vui lòng nhập mã OTP.");
        return;
      }

      startTransition(async () => {
        const res = await verifyRegistrationOtp(username, email, password, otp);
        if (res.success) {
          setUser(res.user);
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(res.error || "Mã OTP không hợp lệ");
        }
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-gray-200">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Portal Helper
        </CardTitle>
        <CardDescription>
          Đăng nhập để xếp lịch và quản lý điểm số
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as "login" | "register");
            setError("");
            setRegisterStep("form");
          }}
          className="w-full mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>

          <TabsContent
            value="login"
            className="animate-in fade-in-50 zoom-in-95 duration-200"
          >
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Tên đăng nhập</Label>
                <Input
                  id="login-username"
                  placeholder="Nhập tên đăng nhập..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          </TabsContent>

          <TabsContent
            value="register"
            className="animate-in fade-in-50 zoom-in-95 duration-200"
          >
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {registerStep === "form" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Tên đăng nhập mới</Label>
                    <Input
                      id="register-username"
                      placeholder="Nhập tên đăng nhập..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Địa chỉ email của bạn..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mật khẩu</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2"
                    disabled={isPending}
                  >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tiếp tục
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2 text-center">
                    <Label htmlFor="register-otp" className="text-base">Mã xác thực (OTP)</Label>
                    <p className="text-sm text-muted-foreground">
                      Chúng tôi đã gửi một mã OTP gồm 8 số đến email <strong>{email}</strong>.
                    </p>
                    <Input
                      id="register-otp"
                      type="text"
                      className="text-center text-xl tracking-[0.5em] font-semibold h-12 mt-2"
                      placeholder="••••••••"
                      maxLength={8}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                  )}
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending}
                    >
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Xác nhận và Tạo tài khoản
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setRegisterStep("form");
                        setError("");
                        setOtp("");
                      }}
                      disabled={isPending}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại
                    </Button>
                  </div>
                </>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
