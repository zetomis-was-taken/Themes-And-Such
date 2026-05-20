"use client";

import Link from "next/link";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/auth/atom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-8 w-full max-w-7xl mx-auto justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-blue-600 hover:opacity-80 transition-opacity"
          >
            Portal Helper
          </Link>
          <div className="hidden md:flex ml-4 gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/schedule" className="hover:text-foreground transition-colors">Xếp lịch học</Link>
            <Link href="/dashboard/grades" className="hover:text-foreground transition-colors">Quản lý điểm</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border border-gray-200"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2 border-b mb-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                </div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer focus:text-red-600"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/auth?tab=login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link href="/auth?tab=register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
