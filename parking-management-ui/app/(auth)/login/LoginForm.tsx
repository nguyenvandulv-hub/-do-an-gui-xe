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



  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center text-2xl font-bold">
        Đăng nhập
      </CardHeader>
      <CardContent className="space-y-4">
        {(loginError || authError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {loginError || authError}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
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
      </CardContent>
    </Card>
  );
};

export default LoginForm;