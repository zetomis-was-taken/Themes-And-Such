"use client";

import Link from "next/link";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/auth/atom";
import { logout } from "@/lib/auth/actions";
import { useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, CalendarPlus, GraduationCap, CalendarDays } from "lucide-react";

export function AppSidebar() {
  const [user, setUser] = useAtom(userAtom);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("schedule_classes");
      localStorage.removeItem("schedule_forbidden_mask");
      localStorage.removeItem("schedule_preferred_mask");
      localStorage.removeItem("schedule_requests");
    }
    router.push("/");
    router.refresh();
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-primary hover:opacity-80 transition-opacity"
        >
          Portal Helper
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/my-schedule")}>
                  <Link href="/my-schedule">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    <span>Lịch Của Tôi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/schedule"}>
                  <Link href="/schedule">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    <span>Xếp Lịch Tự Động</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard/grades"}
                >
                  <div className="flex items-center w-full">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span>Điểm</span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/dashboard/grades?tab=entry">
                        <span>Sửa điểm</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/dashboard/grades?tab=rules">
                        <span>Tạo rule</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-sidebar-accent p-2 rounded-md transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden text-sm">
                      <span className="font-medium truncate">{user.name}</span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="start"
                  side="right"
                  forceMount
                >
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/settings" className="w-full">
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:dark:text-red-400"
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" asChild size="sm" className="w-full">
                  <Link href="/auth?tab=login">Đăng nhập</Link>
                </Button>
                <Button asChild size="sm" className="w-full">
                  <Link href="/auth?tab=register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
