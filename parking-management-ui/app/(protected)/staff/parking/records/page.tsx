"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Car,
  Calendar,
  CreditCard,
  User,
  X,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { useFetchWithAuth } from "@/hooks";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Định nghĩa interface cho record xe
interface ParkingRecord {
  recordId: string;
  licensePlate: string;
  identifier: string;
  vehicleType: {
    id: string;
    name: string;
  };
  cardId: number;
  entryTime: string;
  type: "DAILY" | "MONTHLY";
  staffIn: {
    accountId: string;
    username: string;
    role: string;
  };
}

// Định nghĩa interface cho kết quả API
interface ApiResponse {
  code: number;
  message?: string;
  result: ParkingRecord[];
}

const ITEMS_PER_PAGE = 10; // Số lượng record trên mỗi trang

export default function ParkingRecordsPage() {
  // State cho danh sách record và loading
  const [records, setRecords] = useState<ParkingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { fetchWithAuth, loading } = useFetchWithAuth();

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"plateOrIdentifier" | "cardId">(
    "plateOrIdentifier"
  );
  const [filteredRecords, setFilteredRecords] = useState<ParkingRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch danh sách record khi component mount
  useEffect(() => {
    const fetchParkingRecords = async () => {
      try {
        const apiUrl = buildApiUrl(API_ENDPOINTS.PARKING.RECORDS);
        const data = await fetchWithAuth<ApiResponse>(apiUrl);

        if (data && data.code === 1000 && data.result) {
          const sortedRecords = [...data.result].sort(
            (a, b) =>
              new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
          );
          setRecords(sortedRecords);
          setFilteredRecords(sortedRecords);
          setTotalPages(Math.ceil(sortedRecords.length / ITEMS_PER_PAGE));
        } else if (data) {
          throw new Error(data.message || "Không thể lấy danh sách xe");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách xe:", error);
        setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
        toast.error("Không thể tải danh sách xe");
      }
    };

    fetchParkingRecords();
  }, [fetchWithAuth]);

  // Xử lý tìm kiếm
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRecords(records);
      setIsSearching(false);
      setTotalPages(Math.ceil(records.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
      return;
    }

    setIsSearching(true);
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const results = records.filter((record) => {
      if (searchType === "plateOrIdentifier") {
        return (
          (record.licensePlate?.toLowerCase() || "").includes(lowercasedSearchTerm) ||
          (record.identifier?.toLowerCase() || "").includes(lowercasedSearchTerm)
        );
      } else if (searchType === "cardId") {
        return record.cardId.toString() === lowercasedSearchTerm;
      }

      return false;
    });

    setFilteredRecords(results);
    setTotalPages(Math.ceil(results.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, searchType, records]);

  // Lấy các record hiện tại theo trang
  const getCurrentRecords = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredRecords.slice(startIndex, endIndex);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Tạo mảng số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5; // Số lượng nút trang tối đa hiển thị

    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang nhỏ hơn hoặc bằng maxPagesToShow, hiển thị tất cả các trang
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Nếu tổng số trang lớn hơn maxPagesToShow
      let startPage: number;
      let endPage: number;

      if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
        // Nếu trang hiện tại gần đầu
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + Math.floor(maxPagesToShow / 2) >= totalPages) {
        // Nếu trang hiện tại gần cuối
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        // Trang hiện tại ở giữa
        startPage = currentPage - Math.floor(maxPagesToShow / 2);
        endPage = currentPage + Math.floor(maxPagesToShow / 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  // Format thời gian
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pageNumbers = getPageNumbers();
  const currentRecords = getCurrentRecords();

  return (
    <div className="w-full px-4 py-6">
      {/* Header với breadcrumb */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh sách xe trong bãi</h1>
        <p className="text-gray-500">Hiển thị tất cả xe đang trong bãi đỗ</p>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 mb-8">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Thông tin tổng quát */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng số xe</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vé theo ngày</p>
                <p className="text-2xl font-bold">
                  {records.filter((record) => record.type === "DAILY").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-4">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vé tháng</p>
                <p className="text-2xl font-bold">
                  {records.filter((record) => record.type === "MONTHLY").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách xe */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle>
                {isSearching
                  ? `Kết quả tìm kiếm (${filteredRecords.length})`
                  : `Tất cả xe (${records.length})`}
              </CardTitle>
              <CardDescription>
                {isSearching
                  ? `Đang hiển thị kết quả tìm kiếm cho "${searchTerm}"`
                  : "Danh sách tất cả xe đang có trong bãi"}
              </CardDescription>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 items-end">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={searchType}
                onValueChange={(value) =>
                  setSearchType(value as "plateOrIdentifier" | "cardId")
                }
              >
                <SelectTrigger className="w-full md:w-[170px] h-10">
                  <SelectValue placeholder="Tìm theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plateOrIdentifier">
                    Biển số/Identifier
                  </SelectItem>
                  <SelectItem value="cardId">Card ID</SelectItem>
                </SelectContent>
              </Select>
              {isSearching && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSearchTerm("")}
                  className="h-10 w-10"
                  title="Xóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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
                  <TableHead className="font-medium w-[15%] text-center">
                    Loại xe
                  </TableHead>
                  <TableHead className="font-medium w-[5%] text-center">
                    Card ID
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Loại vé
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Thời gian vào
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Nhân viên
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Car className="h-10 w-10 mb-2 opacity-20" />
                        <span>Không tìm thấy xe nào</span>
                        {isSearching && (
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearchTerm("")}
                            >
                              Xoá tìm kiếm
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((record, index) => (
                    <TableRow
                      key={record.recordId}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }
                    >
                      <TableCell className="text-center text-slate-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {record.licensePlate || (
                          <span className="text-center text-slate-500 italic">
                            {record.identifier}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          {record.vehicleType.name === "Bicycle" && (
                            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
                          )}
                          {record.vehicleType.name === "Motorbike" && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                          )}
                          {record.vehicleType.name === "Scooter" && (
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                          )}
                          {record.vehicleType.name === "Bicycle" ? "Xe đạp" : record.vehicleType.name === "Motorbike" ? "Xe máy" : record.vehicleType.name === "Scooter" ? "Xe tay ga" : record.vehicleType.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {record.cardId}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          {record.type === "MONTHLY" ? (
                            <Badge
                              variant="outline"
                              className="bg-purple-100 text-purple-800 border-purple-200"
                            >
                              Vé tháng
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              Vé ngày
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {formatTimestamp(record.entryTime)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center gap-2">
                          <User className="h-3 w-3 text-slate-400" />
                          {record.staffIn.username}
                        </div>
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
    </div>
  );
}
