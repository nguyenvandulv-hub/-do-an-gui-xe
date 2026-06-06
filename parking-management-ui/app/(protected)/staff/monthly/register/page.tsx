"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CreditCard, Check } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Interface cho loại xe
interface VehicleType {
  id: string;
  name: string;
}

// Interface cho responses từ API
interface VehicleTypesResponse {
  code: number;
  message?: string;
  result?: VehicleType[];
}

interface RegisterCardResponse {
  code: number;
  message?: string;
  result?: {
    id: string;
    issueDate: string;
    expirationDate: string;
    customer: {
      customerId: string;
      customerType: string;
      name: string;
      gender: string;
      dob: string;
      phoneNumber: string;
      address: string;
      email: string;
    };
    vehicle: {
      vehicleId: string;
      licensePlate: string;
      type: {
        id: string;
        name: string;
      };
      brand: string;
      color: string;
    };
    createBy: {
      accountId: string;
      username: string;
      role: string;
    };
    payment: {
      paymentId: string;
      amount: number;
      createAt: string;
      paymentType: string;
    };
  };
}

const isNotBicycle = (vehicleType: VehicleType) => {
  return !vehicleType.name.toLowerCase().includes("bicycle");
};

// Schema xác thực form với Zod
const registerFormSchema = z
  .object({
    // Thông tin chung
    durationInMonths: z.string().refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 12;
    }, "Thời hạn phải từ 1 đến 12 tháng"),

    customerType: z.enum(["LECTURER", "STUDENT"]),

    // Thông tin cá nhân
    name: z.string().min(1, "Họ tên không được để trống"),
    gender: z.enum(["MALE", "FEMALE"]),
    dob: z.string().refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Ngày sinh không hợp lệ"),
    phoneNumber: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    email: z.string().email("Email không hợp lệ"),

    // Thông tin giảng viên/sinh viên
    lecturerId: z.string().optional(),
    studentId: z.string().optional(),
    faculty: z.string().optional(),
    major: z.string().optional(),
    classInfo: z.string().optional(),

    // Thông tin xe
    licensePlate: z.string().min(1, "Biển số xe không được để trống"),
    vehicleTypeId: z.string().min(1, "Vui lòng chọn loại xe"),
    brand: z.string().min(1, "Hãng xe không được để trống"),
    color: z.string().min(1, "Màu xe không được để trống"),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "LECTURER") {
      if (!data.lecturerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mã giảng viên không được để trống",
          path: ["lecturerId"],
        });
      }

      if (data.studentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giảng viên không được nhập mã sinh viên",
          path: ["studentId"],
        });
      }

      if (data.faculty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giảng viên không được nhập thông tin khoa",
          path: ["faculty"],
        });
      }

      if (data.major) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giảng viên không được nhập thông tin ngành",
          path: ["major"],
        });
      }

      if (data.classInfo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Giảng viên không được nhập thông tin lớp",
          path: ["classInfo"],
        });
      }
    }
    // Nếu là sinh viên, phải có studentId, faculty, major, classInfo và lecturerId phải trống
    else if (data.customerType === "STUDENT") {
      if (!data.studentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mã sinh viên không được để trống",
          path: ["studentId"],
        });
      }

      if (!data.faculty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Khoa không được để trống",
          path: ["faculty"],
        });
      }

      if (!data.major) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngành không được để trống",
          path: ["major"],
        });
      }

      if (!data.classInfo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lớp không được để trống",
          path: ["classInfo"],
        });
      }

      if (data.lecturerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sinh viên không được nhập mã giảng viên",
          path: ["lecturerId"],
        });
      }
    }
  });

type FormValues = z.infer<typeof registerFormSchema>;

export default function MonthlyCardRegistrationPage() {
  const { fetchWithAuth, loading: apiLoading } = useFetchWithAuth();
  const [loading, setLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [registrationResult, setRegistrationResult] = useState<
    RegisterCardResponse["result"] | null
  >(null);

  // Khởi tạo form
  const form = useForm<FormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      durationInMonths: "1",
      customerType: "STUDENT",
      name: "",
      gender: "MALE",
      dob: "",
      phoneNumber: "",
      address: "",
      email: "",
      lecturerId: "",
      studentId: "",
      faculty: "",
      major: "",
      classInfo: "",
      licensePlate: "",
      vehicleTypeId: "",
      brand: "",
      color: "",
    },
    mode: "onSubmit",
  });

  // Watch loại khách hàng để hiển thị form phù hợp
  const watchCustomerType = form.watch("customerType");

  // Fetch danh sách loại xe
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        setFetchingTypes(true);

        const apiUrl = buildApiUrl(API_ENDPOINTS.PARKING.VEHICLE_TYPES);
        const data = await fetchWithAuth<VehicleTypesResponse>(apiUrl);

        if (!data) return;

        if (data.code === 1000 && data.result) {
          const filteredTypes = data.result.filter(isNotBicycle);
          setVehicleTypes(filteredTypes);

          // Đặt giá trị mặc định cho loại xe nếu có dữ liệu
          if (filteredTypes.length > 0) {
            form.setValue("vehicleTypeId", filteredTypes[0].id);
          }
        } else {
          throw new Error(data.message || "Không thể lấy danh sách loại xe");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách loại xe:", error);
        toast.error("Không thể lấy danh sách loại xe");
      } finally {
        setFetchingTypes(false);
      }
    };

    fetchVehicleTypes();
  }, [fetchWithAuth, form]);

  // Xử lý submit form - hiển thị dialog xác nhận
  const onSubmit = (values: FormValues) => {
    setFormData(values);
    setShowConfirmDialog(true);
  };

  // Xử lý khi người dùng xác nhận đăng ký
  const handleConfirmRegistration = async () => {
    if (!formData) return;

    try {
      setLoading(true);
      setShowConfirmDialog(false);

      const apiUrl = buildApiUrl(API_ENDPOINTS.MONTHLY_CARDS.REGISTER);
      const data = await fetchWithAuth<RegisterCardResponse>(apiUrl, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!data) return;

      // Xử lý các mã lỗi cụ thể
      if (data.code !== 1000) {
        if (data.code === 5002) {
          form.setError("licensePlate", {
            type: "manual",
            message: "Biển số này đã được đăng ký và còn hạn",
          });
          toast.error("Biển số này đã được đăng ký và còn hạn");
        } else if (data.code === 5003) {
          form.setError("customerType", {
            type: "manual",
            message:
              "Giảng viên phải có mã giảng viên và các trường sinh viên phải trống",
          });
          toast.error("Thông tin giảng viên không hợp lệ");
        } else if (data.code === 5004) {
          form.setError("customerType", {
            type: "manual",
            message:
              "Sinh viên phải có mã sinh viên, khoa, ngành, lớp và mã giảng viên phải trống",
          });
          toast.error("Thông tin sinh viên không hợp lệ");
        } else {
          toast.error(data.message || "Đăng ký thẻ tháng thất bại");
        }
        return;
      }

      // Xử lý khi đăng ký thành công
      if (data.result) {
        setRegistrationResult(data.result);
        setShowSuccessDialog(true);
        form.reset();
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký thẻ tháng:", error);
      toast.error("Đã xảy ra lỗi khi đăng ký thẻ tháng");
    } finally {
      setLoading(false);
    }
  };

  const handleNewRegistration = () => {
    setShowSuccessDialog(false);
    setRegistrationResult(null);
  };

  // Format số tiền thành chuỗi VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format ngày tháng thành chuỗi tiếng Việt
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Kiểm tra loading
  const isLoading = loading || apiLoading || fetchingTypes;

  if (fetchingTypes) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đăng ký thẻ tháng</CardTitle>
          <CardDescription>
            Nhập thông tin để đăng ký thẻ tháng mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Thông tin đăng ký */}
              <div>
                <h3 className="text-lg font-medium mb-4">Thông tin đăng ký</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="durationInMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời hạn đăng ký</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thời hạn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(12)].map((_, index) => (
                              <SelectItem
                                key={index + 1}
                                value={(index + 1).toString()}
                              >
                                {index + 1} tháng
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Thời hạn sử dụng thẻ tháng
                        </FormDescription>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại khách hàng</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset các trường khi chuyển loại khách hàng
                            if (value === "LECTURER") {
                              form.setValue("studentId", "");
                              form.setValue("faculty", "");
                              form.setValue("major", "");
                              form.setValue("classInfo", "");
                            } else {
                              form.setValue("lecturerId", "");
                            }
                            // Xóa lỗi của các trường khi chuyển loại
                            form.clearErrors();
                          }}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại khách hàng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LECTURER">Giảng viên</SelectItem>
                            <SelectItem value="STUDENT">Sinh viên</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Loại đối tượng đăng ký
                        </FormDescription>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Thông tin cá nhân */}
              <div>
                <h3 className="text-lg font-medium mb-4">Thông tin cá nhân</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ tên</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nguyễn Văn A"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Giới tính</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                            disabled={isLoading}
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="MALE" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Nam
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="FEMALE" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Nữ
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} disabled={isLoading} />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
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
                          <Input
                            placeholder="0123456789"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
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
                            placeholder="example@email.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
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
                          <Input
                            placeholder="Địa chỉ của bạn"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Thông tin theo loại khách hàng */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  {watchCustomerType === "LECTURER"
                    ? "Thông tin giảng viên"
                    : "Thông tin sinh viên"}
                </h3>

                {watchCustomerType === "LECTURER" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lecturerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã giảng viên</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mã giảng viên"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="studentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã sinh viên</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Mã sinh viên"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="faculty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Khoa</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Khoa"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="major"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngành</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ngành học"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="classInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lớp</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Lớp"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="min-h-[20px]">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Thông tin xe */}
              <div>
                <h3 className="text-lg font-medium mb-4">Thông tin xe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biển số xe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Biển số xe"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại xe</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại xe" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name === "Bicycle"
                                  ? "Xe đạp"
                                  : type.name === "Motorbike"
                                  ? "Xe máy"
                                  : type.name === "Scooter"
                                  ? "Xe tay ga"
                                  : type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hãng xe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Hãng xe"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Màu xe</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Màu xe"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <div className="min-h-[20px]">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Đăng ký thẻ tháng
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog xác nhận */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng ký thẻ tháng</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Bạn có chắc chắn muốn đăng ký thẻ tháng với thông tin sau đây?
                </p>

                {formData && (
                  <div>
                    {/* Thông tin khách hàng */}
                    <div className="bg-slate-50 p-3 rounded-md space-y-2 mt-2">
                      <div className="text-sm font-semibold text-slate-800">
                        Thông tin khách hàng
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="text-slate-500">Họ tên:</div>
                        <div className="font-medium">{formData.name}</div>

                        <div className="text-slate-500">Loại khách hàng:</div>
                        <div className="font-medium">
                          {formData.customerType === "LECTURER"
                            ? "Giảng viên"
                            : "Sinh viên"}
                        </div>

                        <div className="text-slate-500">Thời hạn:</div>
                        <div className="font-medium">
                          {formData.durationInMonths} tháng
                        </div>

                        <div className="text-slate-500">Số điện thoại:</div>
                        <div className="font-medium">
                          {formData.phoneNumber}
                        </div>
                      </div>
                    </div>

                    {/* Thông tin xe */}
                    <div className="bg-slate-50 p-3 rounded-md space-y-2 mt-3">
                      <div className="text-sm font-semibold text-slate-800">
                        Thông tin xe
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-sm">
                        <div className="text-slate-500">Biển số xe:</div>
                        <div className="font-medium">
                          {formData.licensePlate}
                        </div>

                        <div className="text-slate-500">Loại xe:</div>
                        <div className="font-medium">
                          {vehicleTypes.find(
                            (t) => t.id === formData.vehicleTypeId
                          )?.name || ""}
                        </div>

                        <div className="text-slate-500">Hãng xe:</div>
                        <div className="font-medium">{formData.brand}</div>

                        <div className="text-slate-500">Màu xe:</div>
                        <div className="font-medium">{formData.color}</div>
                      </div>
                    </div>

                    <div className="mt-4 text-amber-600 font-semibold">
                      Lưu ý: Thông tin không thể thay đổi sau khi đăng ký.
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Ngăn dialog tự động đóng
                handleConfirmRegistration();
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đăng ký"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog thành công */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <Check className="mr-2 h-5 w-5" />
              Đăng ký thẻ tháng thành công
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Thẻ tháng đã được đăng ký thành công!</p>

                {registrationResult && (
                  <>
                    {/* Thông tin thẻ */}
                    <div className="bg-slate-50 p-4 rounded-md space-y-4 text-sm">
                      <div className="text-lg font-semibold text-slate-800">
                        Thông tin đăng ký tháng
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-slate-500">Ngày đăng ký:</div>
                        <div className="font-medium">
                          {formatDate(registrationResult.issueDate)}
                        </div>

                        <div className="text-slate-500">Ngày hết hạn:</div>
                        <div className="font-medium">
                          {formatDate(registrationResult.expirationDate)}
                        </div>
                      </div>
                    </div>

                    {/* Thông tin khách hàng */}
                    <div className="bg-slate-50 p-4 rounded-md space-y-4 text-sm">
                      <div className="text-lg font-semibold text-slate-800">
                        Thông tin khách hàng
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-slate-500">Họ tên:</div>
                        <div className="font-medium">
                          {registrationResult.customer.name}
                        </div>

                        <div className="text-slate-500">Loại khách hàng:</div>
                        <div className="font-medium">
                          {registrationResult.customer.customerType ===
                          "LECTURER"
                            ? "Giảng viên"
                            : "Sinh viên"}
                        </div>

                        <div className="text-slate-500">Giới tính:</div>
                        <div className="font-medium">
                          {registrationResult.customer.gender === "MALE"
                            ? "Nam"
                            : "Nữ"}
                        </div>

                        <div className="text-slate-500">Số điện thoại:</div>
                        <div className="font-medium">
                          {registrationResult.customer.phoneNumber}
                        </div>

                        <div className="text-slate-500">Email:</div>
                        <div className="font-medium">
                          {registrationResult.customer.email}
                        </div>

                        <div className="text-slate-500">Địa chỉ:</div>
                        <div className="font-medium">
                          {registrationResult.customer.address}
                        </div>
                      </div>
                    </div>

                    {/* Thông tin xe */}
                    <div className="bg-slate-50 p-4 rounded-md space-y-4 text-sm">
                      <div className="text-lg font-semibold text-slate-800">
                        Thông tin xe
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-slate-500">Biển số xe:</div>
                        <div className="font-medium">
                          {registrationResult.vehicle.licensePlate}
                        </div>

                        <div className="text-slate-500">Loại xe:</div>
                        <div className="font-medium">
                          {registrationResult.vehicle.type.name === "Bicycle"
                            ? "Xe đạp"
                            : registrationResult.vehicle.type.name === "Motorbike"
                            ? "Xe máy"
                            : registrationResult.vehicle.type.name === "Scooter"
                            ? "Xe tay ga"
                            : registrationResult.vehicle.type.name}
                        </div>

                        <div className="text-slate-500">Hãng xe:</div>
                        <div className="font-medium">
                          {registrationResult.vehicle.brand}
                        </div>

                        <div className="text-slate-500">Màu xe:</div>
                        <div className="font-medium">
                          {registrationResult.vehicle.color}
                        </div>
                      </div>
                    </div>

                    {/* Thông tin thanh toán */}
                    <div className="bg-slate-50 p-4 rounded-md space-y-4 text-sm">
                      <div className="text-lg font-semibold text-slate-800">
                        Thông tin thanh toán
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-slate-500">Số tiền:</div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(registrationResult.payment.amount)}
                        </div>

                        <div className="text-slate-500">
                          Thời gian thanh toán:
                        </div>
                        <div className="font-medium">
                          {formatDate(registrationResult.payment.createAt)}
                        </div>

                        <div className="text-slate-500">Loại thanh toán:</div>
                        <div className="font-medium">Phí thẻ tháng</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleNewRegistration}
              className="bg-green-600 hover:bg-green-700"
            >
              Đăng ký thẻ mới
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
