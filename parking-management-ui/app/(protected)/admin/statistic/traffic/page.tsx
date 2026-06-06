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
import { Loader2, CalendarIcon, BarChart3 } from "lucide-react";
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
  totalVehicle: number;
}

interface TrafficData {
  month: number;
  year: number;
  weeklyVehicle: WeeklyData[];
  totalWeeks: number;
  totalVehicle: number;
}

interface ApiResponse {
  code: number;
  message?: string;
  result: TrafficData;
}

export default function TrafficStatisticPage() {
  const { fetchWithAuth, loading: fetchLoading } = useFetchWithAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);

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
    const fetchTrafficData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = buildApiUrl(API_ENDPOINTS.STATISTICS.TRAFFIC, {
          month: Number(selectedMonth),
          year: Number(selectedYear),
        });
        const data = await fetchWithAuth<ApiResponse>(apiUrl);

        if (data && data.code === 1000) {
          setTrafficData(data.result);
        } else {
          throw new Error(data?.message || "Không thể lấy dữ liệu thống kê");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
        toast.error("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
  }, [fetchWithAuth, selectedMonth, selectedYear]);

  // Format ngày tháng
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Xử lý dữ liệu cho biểu đồ
  const chartData = {
    labels: trafficData
      ? trafficData.weeklyVehicle.map(
          (week) =>
            `Tuần ${week.week} (${formatDate(week.startDate)} - ${formatDate(
              week.endDate
            )})`
        )
      : [],
    datasets: [
      {
        label: "Lượt xe",
        data: trafficData
          ? trafficData.weeklyVehicle.map((week) => week.totalVehicle)
          : [],
        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(37, 99, 235, 0.9)",
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
        text: `Thống kê lượt xe theo tuần - Tháng ${
          trafficData?.month || selectedMonth
        }/${trafficData?.year || selectedYear}`,
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Lượt xe: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        title: {
          display: true,
          text: "Số lượt xe",
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
  if ((loading || fetchLoading) && !trafficData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Thống kê lượt xe ra vào</h1>
        <p className="text-gray-500">
          Xem thống kê lượt xe ra vào theo từng tuần trong tháng
        </p>
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
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng lượt xe trong tháng
                </p>
                <p className="text-2xl font-bold">
                  {trafficData?.totalVehicle || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Số tuần trong tháng
                </p>
                <p className="text-2xl font-bold">
                  {trafficData?.totalWeeks || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-4">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Trung bình lượt xe/tuần
                </p>
                <p className="text-2xl font-bold">
                  {trafficData && trafficData.totalWeeks > 0
                    ? Math.round(
                        trafficData.totalVehicle / trafficData.totalWeeks
                      )
                    : 0}
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
            Biểu đồ thống kê lượt xe tháng {selectedMonth}/{selectedYear}
          </CardTitle>
          <CardDescription>
            Thống kê số lượt xe ra vào theo từng tuần trong tháng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {!loading && trafficData && (
              <Bar data={chartData} options={chartOptions} />
            )}
            {!loading && !trafficData && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BarChart3 className="h-16 w-16 mb-4 opacity-20" />
                <p>Không có dữ liệu để hiển thị</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bảng chi tiết */}
      {trafficData && (
        <Card className="mt-6 shadow-sm">
          <CardHeader>
            <CardTitle>Chi tiết theo tuần</CardTitle>
            <CardDescription>
              Thông tin chi tiết về lượt xe theo từng tuần trong tháng
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
                      Lượt xe
                    </th>
                    <th className="text-right py-3 px-4 font-medium">% Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {trafficData.weeklyVehicle.map((week, index) => (
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
                        {week.totalVehicle}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {trafficData.totalVehicle === 0
                          ? "0%"
                          : `${Math.round(
                              (week.totalVehicle / trafficData.totalVehicle) *
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
                    <td className="py-3 px-4 text-right font-medium">
                      {trafficData.totalVehicle}
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
