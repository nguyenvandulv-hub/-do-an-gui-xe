"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/trigger"; // Phụ thuộc vào UI hiện tại, hãy dùng input radio nếu Select lỗi
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(4, {
    message: "Tên đăng nhập tối thiểu 4 ký tự",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu tối thiểu 6 ký tự",
  }),
  name: z.string().min(1, {
    message: "Họ và tên là bắt buộc",
  }),
  identification: z.string().min(1, {
    message: "Mã định danh (CCCD) là bắt buộc",
  }),
  dob: z.string().min(1, {
    message: "Ngày sinh là bắt buộc",
  }),
  gender: z.enum(["MALE", "FEMALE"]),
  phoneNumber: z.string().min(10, {
    message: "Số điện thoại tối thiểu 10 ký tự",
  }),
  address: z.string().min(1, {
    message: "Địa chỉ là bắt buộc",
  }),
  email: z.string().email({
    message: "Email không đúng định dạng",
  }),
  otp: z.string().min(6, {
    message: "Mã OTP gồm 6 ký tự số",
  }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      identification: "",
      dob: "",
      gender: "MALE",
      phoneNumber: "",
      address: "",
      email: "",
      otp: "",
    },
  });

  const sendOtp = async () => {
    const email = form.getValues("email");
    if (!email || !email.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ trước khi gửi OTP");
      return;
    }

    try {
      setIsSendingOtp(true);
      setErrorMsg(null);
      const url = buildApiUrl(API_ENDPOINTS.AUTH.SEND_OTP);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.code === 1000) {
        setOtpSent(true);
        toast.success("Đã gửi OTP về Gmail của bạn!");
      } else {
        setErrorMsg(data.message || "Gửi OTP thất bại.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối đến server");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const url = buildApiUrl(API_ENDPOINTS.AUTH.REGISTER_STAFF);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.code === 1000) {
        toast.success("Đăng ký thành công! Đang chờ Admin duyệt.");
        router.push("/login");
      } else {
        setErrorMsg(data.message || "Đăng ký không thành công");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi hệ thống");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[500px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Đăng ký nhân viên</CardTitle>
        <CardDescription>Nhập thông tin chi tiết và xác thực email để đăng ký</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {errorMsg}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Tên đăng nhập</FormLabel>
                    <FormControl><Input placeholder="Username" disabled={isLoading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Mật khẩu</FormLabel>
                    <FormControl><Input type="password" placeholder="Password" disabled={isLoading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-zinc-500">Họ và tên nhân viên</FormLabel>
                  <FormControl><Input placeholder="Nguyen Van A" disabled={isLoading} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="identification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Số định danh (CCCD)</FormLabel>
                    <FormControl><Input placeholder="012345678912" disabled={isLoading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Ngày sinh</FormLabel>
                    <FormControl><Input type="date" disabled={isLoading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Giới tính</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="MALE" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer">Nam</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="FEMALE" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer">Nữ</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-zinc-500">Số điện thoại</FormLabel>
                    <FormControl><Input placeholder="0987654321" disabled={isLoading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-zinc-500">Địa chỉ thường trú</FormLabel>
                  <FormControl><Input placeholder="Địa chỉ" disabled={isLoading} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-zinc-500">Địa chỉ Email (để nhận OTP)</FormLabel>
                      <FormControl><Input type="email" placeholder="example@gmail.com" disabled={isLoading} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="button" onClick={sendOtp} disabled={isSendingOtp} className="mb-2">
                {isSendingOtp ? "Đang gửi..." : "Gửi OTP"}
              </Button>
            </div>

            {otpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-red-500">Mã xác thực OTP (Xem trong Gmail)</FormLabel>
                    <FormControl><Input placeholder="Nhập 6 số OTP" disabled={isLoading} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !otpSent}>
              {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm text-gray-500 mt-2">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-500 hover:underline font-semibold">
            Đăng nhập ngay
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
