"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Car,
  CalendarDays,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";

const StaffSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Hàm để xử lý điều hướng và đóng sidebar trên mobile
  const handleNavigation = (href: string) => {
    router.push(href);
    // Tạo và dispatch event để đóng sidebar trên mobile
    const customEvent = new CustomEvent("closeMobileSidebar");
    document.dispatchEvent(customEvent);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b shrink-0">
        <h2 className="text-xl font-bold tracking-tight">STAFF PAGE</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="space-y-1">
          {/* Dashboard - Trang chủ */}
          <div
            className={cn(
              "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
              isActive("/staff/dashboard") &&
                "bg-slate-100 text-slate-900 font-medium"
            )}
            onClick={() => handleNavigation("/staff/dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Tổng quan
          </div>

          <Accordion type="single" collapsible className="w-full border-0">
            <AccordionItem value="parking" className="border-0">
              <AccordionTrigger
                className={cn(
                  "py-2 text-sm hover:bg-slate-100 hover:no-underline rounded-md",
                  isActive("/staff/parking") && "bg-slate-100 font-medium"
                )}
              >
                <span className="flex w-full items-center">
                  <Car className="mr-2 h-4 w-4" />
                  Quản lý xe
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-6 py-0">
                <div
                  className={cn(
                    "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
                    isActive("/staff/parking/entry") &&
                      "bg-slate-100 text-slate-900 font-medium"
                  )}
                  onClick={() => handleNavigation("/staff/parking/entry")}
                >
                  Ghi nhận xe vào
                </div>
                <div
                  className={cn(
                    "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
                    isActive("/staff/parking/exit") &&
                      "bg-slate-100 text-slate-900 font-medium"
                  )}
                  onClick={() => handleNavigation("/staff/parking/exit")}
                >
                  Ghi nhận xe ra
                </div>
                <div
                  className={cn(
                    "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
                    isActive("/staff/parking/records") &&
                      "bg-slate-100 text-slate-900 font-medium"
                  )}
                  onClick={() => handleNavigation("/staff/parking/records")}
                >
                  Xe đang trong bãi
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="monthly" className="border-0">
              <AccordionTrigger
                className={cn(
                  "py-2 text-sm hover:bg-slate-100 hover:no-underline rounded-md",
                  isActive("/staff/monthly") && "bg-slate-100 font-medium"
                )}
              >
                <span className="flex w-full items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Thẻ tháng
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-6 py-0">
                <div
                  className={cn(
                    "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
                    isActive("/staff/monthly/register") &&
                      "bg-slate-100 text-slate-900 font-medium"
                  )}
                  onClick={() => handleNavigation("/staff/monthly/register")}
                >
                  Đăng ký thẻ tháng
                </div>
                <div
                  className={cn(
                    "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
                    isActive("/staff/monthly/list-registration") &&
                      "bg-slate-100 text-slate-900 font-medium"
                  )}
                  onClick={() =>
                    handleNavigation("/staff/monthly/list-registration")
                  }
                >
                  Danh sách thẻ tháng
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Missing Vehicle Reports */}
          <div
            className={cn(
              "flex w-full items-center py-2 text-sm transition-all hover:bg-slate-100 rounded-md cursor-pointer",
              isActive("/staff/missing") &&
                "bg-slate-100 text-slate-900 font-medium"
            )}
            onClick={() => handleNavigation("/staff/missing")}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Báo mất thẻ xe
          </div>
        </div>
      </div>

      {/* Thêm phần dưới cùng (nếu cần) */}
      <div className="mt-auto border-t py-2 px-4 shrink-0">
        <div className="text-xs text-slate-500">© 2025 Parking Management</div>
      </div>
    </div>
  );
};

export default StaffSidebar;
