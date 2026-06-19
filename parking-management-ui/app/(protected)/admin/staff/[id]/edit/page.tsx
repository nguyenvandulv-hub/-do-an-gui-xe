"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Save,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { vi } from "date-fns/locale";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Định nghĩa kiểu dữ liệu
interface StaffResponse {
  code: number;
  result: Staff;
  message?: string;
}

interface Staff {
  accountId: string;
  username: string;
  identification: string;
  name: string;
  dob: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  address: string;
  email: string;
  isActive: boolean;
}

// Schema validation với Zod
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên không được quá 50 ký tự"),
  identification: z
    .string()
    .min(9, "CCCD/CMND phải có ít nhất 9 ký tự")
    .max(12, "CCCD/CMND không được quá 12 ký tự")
    .regex(/^\d+$/, "CCCD/CMND chỉ được chứa số"),
  dob: z.date({
    required_error: "Vui lòng chọn ngày sinh",
  }).refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, {
    message: "Nhân viên phải từ 18 tuổi trở lên",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Vui lòng chọn giới tính",
  }),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(11, "Số điện thoại không được quá 11 số")
    .regex(/^\d+$/, "Số điện thoại chỉ được chứa số"),
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
  address: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(200, "Địa chỉ không được quá 200 ký tự"),
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(20, "Username không được quá 20 ký tự"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditStaffPage() {
  const params = useParams();
  const staffId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [originalStaff, setOriginalStaff] = useState<Staff | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formValues, setFormValues] = useState<FormValues | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      identification: "",
      dob: undefined,
      gender: undefined,
      phoneNumber: "",
      email: "",
      address: "",
      username: "",
    },
  });

  // Fetch staff data when component mounts
  useEffect(() => {
    let isMounted = true;

    const fetchStaffData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
          return;
        }

        const apiUrl = buildApiUrl(API_ENDPOINTS.ADMIN.STAFF_DETAIL(staffId));
        const response = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }

        const data: StaffResponse = await response.json();

        if (data.code === 1000 && data.result) {
          // Store the original staff data
          setOriginalStaff(data.result);

          // Parse date string to Date object
          const dobDate = new Date(data.result.dob);

          // Set form values
          form.reset({
            name: data.result.name,
            identification: data.result.identification,
            dob: dobDate,
            gender: data.result.gender,
            phoneNumber: data.result.phoneNumber,
            email: data.result.email,
            address: data.result.address,
            username: data.result.username,
          });
        } else if (isMounted) {
          toast.error("Không thể tải thông tin nhân viên");
        }
      } catch (err) {
        console.error("Error fetching staff data:", err);
        if (isMounted) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin nhân viên"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (staffId) {
      fetchStaffData();
    }

    return () => {
      isMounted = false;
    };
  }, [staffId, form]);

  const handleConfirm = async () => {
    if (!formValues) return;

    try {
      setSubmitting(true);
      setShowConfirmDialog(false);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        return;
      }

      // Format the date to yyyy-MM-dd
      const formattedDob = format(formValues.dob, "yyyy-MM-dd");

      // Bảo toàn trạng thái isActive từ dữ liệu gốc
      const requestBody = {
        username: formValues.username,
        identification: formValues.identification,
        name: formValues.name,
        dob: formattedDob,
        gender: formValues.gender,
        phoneNumber: formValues.phoneNumber,
        address: formValues.address,
        email: formValues.email,
        isActive: originalStaff?.isActive || true,
      };

      const apiUrl = buildApiUrl(API_ENDPOINTS.ADMIN.STAFF_DETAIL(staffId));
      const response = await fetch(
        apiUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      // Handle specific error codes
      if (!response.ok) {
        if (data.code === 2001) {
          form.setError("username", {
            type: "manual",
            message: "Tên đăng nhập đã tồn tại",
          });
          toast.error("Tên đăng nhập đã tồn tại");
        } else if (data.code === 2002) {
          form.setError("identification", {
            type: "manual",
            message: "Số CCCD/CMND đã được sử dụng",
          });
          toast.error("Số CCCD/CMND đã được sử dụng");
        } else {
          toast.error(data.message || `Lỗi: ${response.status}`);
        }
        return; // Dừng thực thi sau khi hiển thị thông báo lỗi
      }

      // Xử lý khi request thành công
      if (data.code === 1000) {
        toast.success("Cập nhật thông tin nhân viên thành công");
        setTimeout(() => {
          router.push("/admin/staff/staff-list");
        }, 1000); // Delay chuyển hướng để người dùng thấy thông báo thành công
      } else {
        toast.error(data.message || "Cập nhật thông tin thất bại");
      }
    } catch (err) {
      console.error("Error updating staff:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật thông tin nhân viên"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    setFormValues(values);
    setShowConfirmDialog(true);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa thông tin nhân viên</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>
              Cập nhật thông tin cá nhân của nhân viên
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đăng nhập</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên đăng nhập"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập họ và tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="identification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CMND/CCCD</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số CMND/CCCD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Ngày sinh</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                ) : (
                                  <span>Chọn ngày sinh</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3 border-b border-border flex justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <div className="flex items-center">
                                  <span className="text-sm mr-1">Tháng:</span>
                                  <select
                                    value={
                                      field.value
                                        ? field.value.getMonth() + 1
                                        : new Date().getMonth() + 1
                                    }
                                    onChange={(e) => {
                                      const month = parseInt(e.target.value);
                                      const newDate = field.value
                                        ? new Date(field.value)
                                        : new Date();
                                      newDate.setMonth(month - 1);
                                      field.onChange(new Date(newDate));
                                    }}
                                    className="w-16 px-2 py-1 rounded border text-sm bg-background"
                                  >
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                      <option key={m} value={m}>{m}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm mr-1">Năm:</span>
                                  <select
                                    value={
                                      field.value
                                        ? field.value.getFullYear()
                                        : new Date().getFullYear() - 18
                                    }
                                    onChange={(e) => {
                                      const year = parseInt(e.target.value);
                                      const newDate = field.value
                                        ? new Date(field.value)
                                        : new Date();
                                      newDate.setFullYear(year);
                                      field.onChange(new Date(newDate));
                                    }}
                                    className="w-24 px-2 py-1 rounded border text-sm bg-background"
                                  >
                                    {Array.from(
                                      { length: new Date().getFullYear() - 18 - 1900 + 1 },
                                      (_, i) => new Date().getFullYear() - 18 - i
                                    ).map(y => (
                                      <option key={y} value={y}>{y}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              month={field.value || undefined}
                              defaultMonth={field.value || new Date()}
                              disabled={(date) => {
                                const eighteenYearsAgo = new Date();
                                eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
                                return date > eighteenYearsAgo || date < new Date("1900-01-01");
                              }}
                              initialFocus
                              locale={vi}
                              captionLayout="buttons"
                              onMonthChange={(month) => {
                                // Khi calendar thay đổi tháng, cập nhật lại field value để giữ nguyên ngày
                                const newDate = field.value
                                  ? new Date(field.value)
                                  : new Date();
                                newDate.setMonth(month.getMonth());
                                newDate.setFullYear(month.getFullYear());
                                field.onChange(new Date(newDate));
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Nam</SelectItem>
                            <SelectItem value="FEMALE">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Nhập địa chỉ email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Địa chỉ</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nhập địa chỉ"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Hủy
                  </Button>
                  <Button type="submit" className="gap-1">
                    <Save className="h-4 w-4 mr-1" />
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Dialog xác nhận */}
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận thay đổi</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn cập nhật thông tin của nhân viên này?
                Những thay đổi này sẽ được lưu vào cơ sở dữ liệu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={submitting}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
