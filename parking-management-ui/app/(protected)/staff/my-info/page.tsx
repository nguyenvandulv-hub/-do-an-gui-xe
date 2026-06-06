"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  CircleUser,
  CircleUserRound,
  HelpCircle
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Sử dụng useEffect nhưng không gọi refreshUserInfo
  useEffect(() => {
    // Chỉ cần đợi một khoảng thời gian ngắn để đảm bảo dữ liệu user đã được tải
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Format ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Thông tin cá nhân của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Chi tiết thông tin cá nhân của bạn trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thông tin cá nhân */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 flex items-start">
              <User className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{user?.name || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2 flex items-start">
              <CreditCard className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">CMND/CCCD</p>
                <p className="font-medium">{user?.identification || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2 flex items-start">
              <Calendar className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-medium">{formatDate(user?.dob)}</p>
              </div>
            </div>

            <div className="space-y-2 flex items-start">
              {user?.gender === "MALE" ? (
                <CircleUser className="h-5 w-5 mr-2" />
              ) : user?.gender === "FEMALE" ? (
                <CircleUserRound className="h-5 w-5 mr-2" />
              ) : (
                <HelpCircle className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Giới tính</p>
                <p className="font-medium">
                  {user?.gender === "MALE"
                    ? "Nam"
                    : user?.gender === "FEMALE"
                    ? "Nữ"
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-2 flex items-start">
              <Phone className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Số điện thoại</p>
                <p className="font-medium">{user?.phoneNumber || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2 flex items-start">
              <Mail className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2 flex items-start md:col-span-2">
              <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Địa chỉ</p>
                <p className="font-medium">{user?.address || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
