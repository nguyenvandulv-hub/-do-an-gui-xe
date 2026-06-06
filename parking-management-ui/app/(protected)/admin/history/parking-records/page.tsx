"use client";

import { useState, useEffect } from "react";
import {
  format,
  parseISO,
  differenceInMinutes,
  differenceInHours,
  addDays,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Search,
  Car,
  Clock,
  CreditCard,
  ArrowLeftRight,
  User,
  Info,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { MaterialIcon } from "@/components/Icon";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Định nghĩa interfaces
interface VehicleType {
  id: string;
  name: string;
}

interface Card {
  cardId: number;
}

interface Staff {
  accountId: string;
  username: string;
  password: string;
  role: string;
}

interface Payment {
  paymentId: string;
  amount: number;
  createAt: string;
  paymentType: string;
}

interface ParkingHistoryRecord {
  historyId: string;
  licensePlate?: string;
  identifier?: string;
  vehicleType: VehicleType;
  card: Card;
  entryTime: string;
  exitTime: string;
  type: "DAILY" | "MONTHLY";
  payment: Payment;
  staffIn: Staff;
  staffOut: Staff;
}

interface ApiResponse {
  code: number;
  message?: string;
  result: ParkingHistoryRecord[];
}

// Số lượng bản ghi trên mỗi trang
const ITEMS_PER_PAGE = 10;

export default function ParkingHistoryPage() {
  const { fetchWithAuth, loading: apiLoading } = useFetchWithAuth();

  // State cho chọn ngày và tháng
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // State cho danh sách bản ghi
  const [historyRecords, setHistoryRecords] = useState<ParkingHistoryRecord[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRecords, setFilteredRecords] = useState<
    ParkingHistoryRecord[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // State cho dialog chi tiết
  const [selectedRecord, setSelectedRecord] =
    useState<ParkingHistoryRecord | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Hàm lấy dữ liệu cho ngày đã chọn
  const fetchHistoryData = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      const month = date.getMonth() + 1; // getMonth() trả về 0-11
      const day = date.getDate();

      const apiUrl = buildApiUrl(API_ENDPOINTS.PARKING.RECORD_HISTORY, {month, day})
      const data = await fetchWithAuth<ApiResponse>(apiUrl);

      if (data && data.code === 1000) {
        // Sắp xếp theo thời gian ra mới nhất lên đầu
        const sortedRecords = [...data.result].sort(
          (a, b) =>
            new Date(b.exitTime).getTime() - new Date(a.exitTime).getTime()
        );

        setHistoryRecords(sortedRecords);
        setFilteredRecords(sortedRecords);
        setTotalPages(Math.ceil(sortedRecords.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
      } else {
        throw new Error(data?.message || "Không thể lấy dữ liệu lịch sử");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu lịch sử:", error);
      setError("Không thể tải lịch sử xe ra vào. Vui lòng thử lại sau.");
      toast.error("Không thể tải lịch sử xe ra vào");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn ngày
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
      fetchHistoryData(date);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    if (selectedDate) {
      fetchHistoryData(selectedDate);
    }
  }, []);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(historyRecords);
      setIsSearching(false);
      setTotalPages(Math.ceil(historyRecords.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      return;
    }

    setIsSearching(true);
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const results = historyRecords.filter((record) => {
      return (
        (record.licensePlate &&
          record.licensePlate.toLowerCase().includes(lowercasedSearchTerm)) ||
        (record.identifier &&
          record.identifier.toLowerCase().includes(lowercasedSearchTerm)) ||
        (record.staffIn?.username &&
          record.staffIn.username.toLowerCase().includes(lowercasedSearchTerm)) ||
        (record.staffOut?.username &&
          record.staffOut.username.toLowerCase().includes(lowercasedSearchTerm)) ||
        (record.card?.cardId && 
          record.card.cardId.toString().includes(lowercasedSearchTerm))
      );
    });

    setFilteredRecords(results);
    setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, historyRecords]);

  // Lấy các bản ghi hiển thị trên trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredRecords.slice(startIndex, endIndex);
  };

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Tạo mảng số trang để hiển thị phân trang
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage: number;
      let endPage: number;

      if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Format thời gian đầy đủ
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm - dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Tính thời gian đỗ xe
  const calculateParkingDuration = (entryTime: string, exitTime: string) => {
    const entry = parseISO(entryTime);
    const exit = parseISO(exitTime);

    const minutes = differenceInMinutes(exit, entry);
    const hours = differenceInHours(exit, entry);

    if (hours < 1) {
      return `${minutes} phút`;
    } else {
      const remainingMinutes = minutes % 60;
      return `${hours} giờ ${remainingMinutes} phút`;
    }
  };

  // Hiển thị chi tiết bản ghi
  const showRecordDetail = (record: ParkingHistoryRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  // Hiển thị loader khi đang tải dữ liệu
  if (loading || apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Lấy dữ liệu hiển thị trên trang hiện tại
  const currentRecords = getCurrentPageItems();
  const pageNumbers = getPageNumbers();

  // Lấy các thống kê cho biểu đồ
  const bicycleCount = historyRecords.filter(
    (record) => record.vehicleType.name === "Bicycle"
  ).length;

  const motorbikeCount = historyRecords.filter(
    (record) => record.vehicleType.name === "Motorbike"
  ).length;

  const carCount = historyRecords.filter(
    (record) => record.vehicleType.name === "Car"
  ).length;

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lịch sử xe ra vào</h1>
        <p className="text-gray-500">
          Xem các bản ghi xe ra vào hoàn chỉnh theo ngày
        </p>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Bộ chọn ngày và tìm kiếm */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[240px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd 'tháng' MM, yyyy", { locale: vi })
                ) : (
                  <span>Chọn ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) =>
                  date > today ||
                  date < addDays(new Date(today.getFullYear(), 0, 1), 0)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Tìm kiếm biển số, thẻ, nhân viên..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Thống kê tổng quát */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng lượt xe</p>
                <p className="text-2xl font-bold">{historyRecords.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="px-1.5 py-1 rounded-full bg-yellow-100 mr-4">
                <MaterialIcon icon="pedal_bike" className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Xe đạp</p>
                <p className="text-2xl font-bold">{bicycleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="px-1.5 py-1 rounded-full bg-blue-100 mr-4">
                <MaterialIcon icon="motorcycle" className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Xe máy</p>
                <p className="text-2xl font-bold">{motorbikeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="px-1.5 py-1 rounded-full bg-purple-100 mr-4">
                <MaterialIcon
                  icon="electric_scooter"
                  className="text-purple-600"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Xe tay ga</p>
                <p className="text-2xl font-bold">{carCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng lịch sử giao dịch */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center">
            <div>
              <CardTitle>
                {isSearching
                  ? `Kết quả tìm kiếm (${filteredRecords.length})`
                  : `Lịch sử giao dịch ngày ${
                      selectedDate
                        ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                        : ""
                    } (${historyRecords.length})`}
              </CardTitle>
              <CardDescription>
                {isSearching
                  ? `Đang hiển thị kết quả tìm kiếm cho "${searchTerm}"`
                  : `Danh sách xe ra vào hoàn chỉnh theo ngày ${
                      selectedDate
                        ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                        : ""
                    }`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="font-medium w-[5%] text-center">
                    STT
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Biển số/Identifier
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Loại xe
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Mã thẻ
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Vào bãi
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Ra bãi
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Thời gian
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Phí (VNĐ)
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-10 w-10 mb-2 opacity-20" />
                        <span>Không tìm thấy bản ghi nào</span>
                        {isSearching && (
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                            >
                              Xóa tìm kiếm
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record, index) => (
                    <TableRow
                      key={record.historyId}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }
                    >
                      <TableCell className="text-center text-slate-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {record.licensePlate || (
                          <span className="text-slate-500 italic">
                            ID: {record.identifier}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full inline-block ${
                              record.vehicleType.name === "Bicycle"
                                ? "bg-yellow-500"
                                : record.vehicleType.name === "Motorbike"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                          ></span>
                          {record.vehicleType.name === "Bicycle"
                            ? "Xe đạp"
                            : record.vehicleType.name === "Motorbike"
                            ? "Xe máy"
                            : record.vehicleType.name === "Scooter"
                            ? "Xe tay ga"
                            : record.vehicleType.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {record.card.cardId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {formatDateTime(record.entryTime)}
                        <div className="text-xs text-slate-500 mt-1">
                          NV: {record.staffIn.username}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {formatDateTime(record.exitTime)}
                        <div className="text-xs text-slate-500 mt-1">
                          NV: {record.staffOut.username}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {calculateParkingDuration(
                          record.entryTime,
                          record.exitTime
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {record.payment.amount.toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => showRecordDetail(record)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="py-4 border-t px-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {pageNumbers[0] > 1 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {pageNumbers[0] > 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {pageNumbers.map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={pageNumber === currentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog chi tiết bản ghi */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về giao dịch ra vào bãi đỗ
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-slate-50 p-3 rounded-md">
                  <h3 className="font-semibold text-slate-700 mb-2 flex items-center">
                    <Car className="h-4 w-4 mr-2 text-slate-600" />
                    Thông tin xe
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-slate-500">Loại xe:</div>
                    <div className="font-medium col-span-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            selectedRecord.vehicleType.name === "Bicycle"
                              ? "bg-yellow-500"
                              : selectedRecord.vehicleType.name === "Motorbike"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        ></span>
                        {selectedRecord.vehicleType.name === "Bicycle"
                          ? "Xe đạp"
                          : selectedRecord.vehicleType.name === "Motorbike"
                          ? "Xe máy"
                          : selectedRecord.vehicleType.name === "Scooter"
                          ? "Xe tay ga"
                          : selectedRecord.vehicleType.name}
                      </div>
                    </div>

                    <div className="text-slate-500">Biển số:</div>
                    <div className="font-medium col-span-2">
                      {selectedRecord.licensePlate || "Không có"}
                    </div>

                    <div className="text-slate-500">Identifier:</div>
                    <div className="font-medium col-span-2">
                      {selectedRecord.identifier || "Không có"}
                    </div>

                    <div className="text-slate-500">Mã thẻ:</div>
                    <div className="font-medium col-span-2">
                      {selectedRecord.card.cardId}
                    </div>

                    <div className="text-slate-500">Loại vé:</div>
                    <div className="font-medium col-span-2">
                      {selectedRecord.type === "DAILY" ? "Vé ngày" : "Vé tháng"}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-slate-50 p-3 rounded-md">
                  <h3 className="font-semibold text-slate-700 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-600" />
                    Thời gian
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-slate-500">Thời gian vào:</div>
                    <div className="font-medium col-span-2">
                      {formatDateTime(selectedRecord.entryTime)}
                    </div>

                    <div className="text-slate-500">Thời gian ra:</div>
                    <div className="font-medium col-span-2">
                      {formatDateTime(selectedRecord.exitTime)}
                    </div>

                    <div className="text-slate-500">Thời gian đỗ:</div>
                    <div className="font-medium col-span-2">
                      {calculateParkingDuration(
                        selectedRecord.entryTime,
                        selectedRecord.exitTime
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-md">
                  <h3 className="font-semibold text-slate-700 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-600" />
                    Nhân viên
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">Nhân viên vào:</div>
                    <div className="font-medium">
                      {selectedRecord.staffIn.username}
                    </div>

                    <div className="text-slate-500">Nhân viên ra:</div>
                    <div className="font-medium">
                      {selectedRecord.staffOut.username}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-md">
                  <h3 className="font-semibold text-slate-700 mb-2 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-slate-600" />
                    Thanh toán
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-500">Số tiền:</div>
                    <div className="font-medium">
                      {selectedRecord.payment.amount.toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </div>

                    <div className="text-slate-500">Loại thanh toán:</div>
                    <div className="font-medium">
                      {selectedRecord.payment.paymentType === "PARKING"
                        ? "Phí gửi xe"
                        : "Khác"}
                    </div>

                    <div className="text-slate-500">Thời gian:</div>
                    <div className="font-medium">
                      {formatDateTime(selectedRecord.payment.createAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
