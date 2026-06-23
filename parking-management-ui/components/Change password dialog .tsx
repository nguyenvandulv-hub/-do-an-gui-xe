"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { API_ENDPOINTS } from "@/config/api";

// Kiểu dữ liệu trả về từ API (ApiResponse<String> ở backend)
interface ApiResponse {
  code?: number;
  message?: string;
  result?: string;
}

export function ChangePasswordDialog() {
  const { fetchWithAuth, loading } = useFetchWithAuth();

  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Hiện/ẩn mật khẩu cho từng ô
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset toàn bộ form
  const resetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleSubmit = async () => {
    // 1) Kiểm tra phía client trước khi gọi API (đỡ gọi thừa)
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword === oldPassword) {
      toast.error("Mật khẩu mới phải khác mật khẩu cũ");
      return;
    }

    // 2) Gọi API đổi mật khẩu (PUT /auth/change-password)
    try {
      const res = await fetchWithAuth<ApiResponse>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          method: "PUT",
          body: JSON.stringify({ oldPassword, newPassword }),
        },
      );

      // Backend trả code = 1000 khi thành công; nếu khác thì là lỗi nghiệp vụ
      if (res?.code && res.code !== 1000) {
        toast.error(mapError(res.message));
        return;
      }

      toast.success("Đổi mật khẩu thành công");
      resetForm();
      setOpen(false);
    } catch (error) {
      // Lỗi mạng / 401 đã được hook xử lý, ở đây báo chung
      toast.error("Đổi mật khẩu thất bại, vui lòng thử lại");
    }
  };

  // Đổi mã lỗi của backend sang câu tiếng Việt dễ hiểu
  const mapError = (message?: string): string => {
    switch (message) {
      case "AUTH_WRONG_PASSWORD":
        return "Mật khẩu cũ không đúng";
      case "AUTH_PASSWORD_SAME_AS_OLD":
        return "Mật khẩu mới phải khác mật khẩu cũ";
      case "AUTH_PASSWORD_INVALID":
        return "Mật khẩu mới phải có ít nhất 6 ký tự";
      default:
        return message || "Đổi mật khẩu thất bại";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm(); // đóng dialog thì xóa dữ liệu đã nhập
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <KeyRound className="h-4 w-4" />
          Đổi mật khẩu
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mật khẩu cũ */}
          <div className="space-y-2">
            <Label htmlFor="old-password">Mật khẩu hiện tại</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <ToggleEye show={showOld} onClick={() => setShowOld(!showOld)} />
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
              />
              <ToggleEye show={showNew} onClick={() => setShowNew(!showNew)} />
            </div>
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
              <ToggleEye
                show={showConfirm}
                onClick={() => setShowConfirm(!showConfirm)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Nút con mắt để hiện/ẩn mật khẩu
function ToggleEye({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}
