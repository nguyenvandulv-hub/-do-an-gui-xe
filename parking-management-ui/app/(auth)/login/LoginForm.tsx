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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

const LoginForm = () => {
  const router = useRouter();
  const { login, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
 
  const [loginError, setLoginError] = useState<string | null>(null);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      // Sử dụng login từ useAuth
      const response = await login(data.username, data.password);

      // Kiểm tra kết quả
      if (response && response.code === 1000) {
        
        // Điều hướng dựa theo vai trò
        const userRole = response.result?.role;
        if (userRole === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/staff/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error: ", error);
      setLoginError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi đăng nhập"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { loginWithGoogle } = useAuth();
  const [googleMsg, setGoogleMsg] = useState<string | null>(null);

  // Khởi tạo Google One Tap / Button Login
  useState(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google?.accounts.id.initialize({
          client_id: "354002613146-24e58h75a74k87h2o5c7qac8pgg61dfa.apps.googleusercontent.com", // client id mẫu, user có thể cấu hình thông qua NEXT_PUBLIC_GOOGLE_CLIENT_ID
          callback: async (response: any) => {
            try {
              setIsLoading(true);
              setLoginError(null);
              setGoogleMsg(null);
              const result = await loginWithGoogle(response.credential);
              if (result && result.code === 1012) {
                setGoogleMsg("Đăng ký tài khoản Google thành công! Vui lòng chờ Admin duyệt để có thể đăng nhập.");
              } else if (result && result.code === 1000) {
                const userRole = result.result?.role;
                if (userRole === "ADMIN") {
                  router.push("/admin/dashboard");
                } else {
                  router.push("/staff/dashboard");
                }
              }
            } catch (err: any) {
              setLoginError(err.message || "Đăng nhập Google thất bại");
            } finally {
              setIsLoading(false);
            }
          },
        });
        window.google?.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 350 }
        );
      };
      document.head.appendChild(script);
    }
  });

  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center text-2xl font-bold">
        Đăng nhập
      </CardHeader>
      <CardContent className="space-y-4">
        {googleMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            {googleMsg}
          </div>
        )}
        {(loginError || authError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {loginError || authError}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Tên đăng nhập
                  </FormLabel>
                  <FormControl>
                    <Input

                      className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0"
                      placeholder="Nhập tên đăng nhập"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-white">
                    Mật khẩu
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="bg-slate-100 dark:bg-slate-500 border-0 focus-visible:ring-0 text-black dark:text-white focus-visible:ring-offset-0 pr-10"
                        placeholder="Nhập mật khẩu"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Hoặc</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div id="google-signin-btn"></div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-2">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-500 hover:underline font-semibold">
            Đăng ký nhân viên
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;