"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CalendarIcon,
  WalletIcon,
  BarChart3,
  DollarSign,
  Download,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Định nghĩa interfaces
interface WeeklyData {
  week: number;
  startDate: string;
  endDate: string;
  totalRevenue: number;
}

interface RevenueData {
  month: number;
  year: number;
  weeklyRevenue: WeeklyData[];
  totalWeeks: number;
  totalRevenue: number;
}

interface ApiResponse {
  code: number;
  message?: string;
  result: RevenueData;
}

export default function RevenueStatisticPage() {
  const { fetchWithAuth, loading: fetchLoading } = useFetchWithAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  // State cho việc chọn tháng và năm
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(currentDate.getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(currentDate.getFullYear())
  );

  // Array các tháng trong năm
  const months = [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  // Array các năm gần đây
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) =>
    String(currentYear - 2 + i)
  );

  // Fetch dữ liệu khi component mount hoặc khi tháng/năm thay đổi
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = buildApiUrl(API_ENDPOINTS.STATISTICS.REVENUE, {
          month: Number(selectedMonth),
          year: Number(selectedYear),
        });
        const data = await fetchWithAuth<ApiResponse>(apiUrl);

        if (data && data.code === 1000) {
          setRevenueData(data.result);
        } else {
          throw new Error(
            data?.message || "Không thể lấy dữ liệu thống kê doanh thu"
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê doanh thu:", error);
        setError(
          "Không thể tải dữ liệu thống kê doanh thu. Vui lòng thử lại sau."
        );
        toast.error("Không thể tải dữ liệu thống kê doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [fetchWithAuth, selectedMonth, selectedYear]);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";
      const apiUrl = buildApiUrl("/payments/export");
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Doanh_thu_${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Đã xuất báo cáo Excel thành công");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất báo cáo Excel");
    } finally {
      setLoading(false);
    }
  };

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Format số tiền thành chuỗi VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Xử lý dữ liệu cho biểu đồ
  const chartData = {
    labels: revenueData
      ? revenueData.weeklyRevenue.map(
          (week) =>
            `Tuần ${week.week} (${formatDate(week.startDate)} - ${formatDate(
              week.endDate
            )})`
        )
      : [],
    datasets: [
      {
        label: "Doanh thu",
        data: revenueData
          ? revenueData.weeklyRevenue.map((week) => week.totalRevenue)
          : [],
        backgroundColor: "rgba(22, 163, 74, 0.7)", // Màu xanh lá cây
        borderColor: "rgba(22, 163, 74, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(22, 163, 74, 0.9)",
      },
    ],
  };

  // Cấu hình cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Thống kê doanh thu theo tuần - Tháng ${
          revenueData?.month || selectedMonth
        }/${revenueData?.year || selectedYear}`,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              maximumFractionDigits: 0,
            }).format(context.raw);
            return `Doanh thu: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            if (value === 0) return "0";
            return value >= 1000000
              ? value / 1000000 + "M"
              : value / 1000 + "K";
          },
        },
        title: {
          display: true,
          text: "Doanh thu (VNĐ)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Tuần",
        },
      },
    },
  };

  // Hiển thị loader khi đang tải dữ liệu
  if ((loading || fetchLoading) && !revenueData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Thống kê doanh thu</h1>
          <p className="text-gray-500">
            Xem thống kê doanh thu theo từng tuần trong tháng
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Xuất báo cáo Excel
        </button>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Bộ lọc chọn tháng và năm */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Tháng</label>
          <Select
            value={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Năm</label>
          <Select
            value={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Thẻ tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng doanh thu tháng
                </p>
                <p className="text-2xl font-bold">
                  {revenueData
                    ? formatCurrency(revenueData.totalRevenue)
                    : "0 ₫"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Số tuần trong tháng
                </p>
                <p className="text-2xl font-bold">
                  {revenueData?.totalWeeks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-4">
                <WalletIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Doanh thu trung bình/tuần
                </p>
                <p className="text-2xl font-bold">
                  {revenueData && revenueData.totalWeeks > 0
                    ? formatCurrency(
                        revenueData.totalRevenue / revenueData.totalWeeks
                      )
                    : "0 ₫"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ thống kê */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>
            Biểu đồ doanh thu tháng {selectedMonth}/{selectedYear}
          </CardTitle>
          <CardDescription>
            Thống kê doanh thu theo từng tuần trong tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!loading && revenueData && (
              <Bar data={chartData} options={chartOptions} />
            )}
            {!loading &&
              (!revenueData || revenueData.weeklyRevenue.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <BarChart3 className="h-16 w-16 mb-4 opacity-20" />
                  <p>Không có dữ liệu doanh thu để hiển thị</p>
                  <p className="text-sm mt-2 text-gray-400">
                    Thử chọn tháng hoặc năm khác
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi tiết */}
      {revenueData && (
        <Card className="mt-6 shadow-sm">
          <CardHeader>
            <CardTitle>Chi tiết doanh thu theo tuần</CardTitle>
            <CardDescription>
              Thông tin chi tiết về doanh thu theo từng tuần trong tháng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <th className="text-left py-3 px-4 font-medium">Tuần</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Thời gian
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Doanh thu (VNĐ)
                    </th>
                    <th className="text-right py-3 px-4 font-medium">% Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.weeklyRevenue.map((week, index) => (
                    <tr
                      key={week.week}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }
                    >
                      <td className="py-3 px-4">Tuần {week.week}</td>
                      <td className="py-3 px-4">
                        {formatDate(week.startDate)} -{" "}
                        {formatDate(week.endDate)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(week.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {revenueData.totalRevenue === 0
                          ? "0%"
                          : `${Math.round(
                              (week.totalRevenue / revenueData.totalRevenue) *
                                100
                            )}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <td className="py-3 px-4 font-medium" colSpan={2}>
                      Tổng cộng
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      {formatCurrency(revenueData.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
