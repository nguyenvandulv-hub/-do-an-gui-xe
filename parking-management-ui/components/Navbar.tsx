"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, UserCircle, CarFront } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Hiển thị username trực tiếp
  const displayName = user?.username || "Tài khoản";

  // Xác định đường dẫn dashboard theo role
  const dashboardUrl =
    user?.role === "ADMIN" ? "/admin/dashboard" : "/staff/dashboard";

  const staffProfileUrl = "/staff/my-info";

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      router.replace("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Đã xảy ra lỗi khi đăng xuất");
    }
  };

  return (
    <div className="bg-primary text-white py-2 px-5 flex justify-between items-center z-20">
      <div className="flex items-center">
        {children}
        <Link href={dashboardUrl} className="flex items-center gap-2">
          <div className="bg-orange-500 text-white p-1.5 rounded-md flex items-center justify-center shadow-sm">
            <CarFront size={22} strokeWidth={2.5} />
          </div>
          <div className="text-xl font-bold tracking-tight flex items-center">
            <span>PTIT</span>
            <span className="text-orange-500 ml-1">Parking</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center focus:outline-none hover:bg-primary-600/20 py-1 px-2 rounded-md transition-colors hover:text-gray-400">
            <div className="h-8 w-8 rounded-full bg-primary-600/30 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <span className="max-w-[150px] truncate ml-2">{displayName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name || displayName}</span>
                {/* Hiển thị vai trò */}
                {user?.role && (
                  <span className="text-xs text-gray-500">
                    {user.role === "ADMIN" ? "Quản trị viên" : "Nhân viên"}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={staffProfileUrl} className="w-full flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 cursor-pointer focus:text-red-500 focus:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;
