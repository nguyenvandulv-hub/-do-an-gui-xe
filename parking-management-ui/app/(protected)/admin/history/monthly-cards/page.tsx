"use client";

import { useState, useEffect, useMemo } from "react";
import { format, parseISO, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Calendar,
  User,
  Car,
  Ban,
  CheckCircle2,
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
import { useFetchWithAuth } from "@/hooks/use-fetch-with-auth";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Định nghĩa interfaces
interface VehicleType {
  id: string;
  name: string;
}

interface Vehicle {
  vehicleId: string;
  licensePlate: string;
  type: VehicleType;
  brand: string;
  color: string;
}

interface Customer {
  customerId: string;
  customerType: "STUDENT" | "TEACHER" | "OTHER";
  name: string;
  gender: "MALE" | "FEMALE";
  dob: string;
  phoneNumber: string;
  address: string;
  email: string;
}

interface Staff {
  accountId: string;
  username: string;
  role: string;
}

interface Payment {
  paymentId: string;
  amount: number;
  createAt: string;
  paymentType: string;
}

interface MonthlyCard {
  id: string;
  issueDate: string;
  expirationDate: string;
  customer: Customer;
  vehicle: Vehicle;
  createBy: Staff;
  payment: Payment;
}

// Responses từ API
interface ApiResponse {
  code: number;
  message?: string;
  result: MonthlyCard[];
}

// Số lượng bản ghi trên mỗi trang
const ITEMS_PER_PAGE = 10;

export default function AdminMonthlyCardHistoryPage() {
  const { fetchWithAuth, loading: apiLoading } = useFetchWithAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho danh sách thẻ
  const [activeCards, setActiveCards] = useState<MonthlyCard[]>([]);
  const [expiredCards, setExpiredCards] = useState<MonthlyCard[]>([]);

  // State cho chức năng tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<
    "licensePlate" | "customerName" | "phoneNumber"
  >("licensePlate");
  const [isSearching, setIsSearching] = useState(false);

  // State cho chức năng lọc
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "expired"
  >("all");

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Kết hợp và xử lý danh sách thẻ tháng
  const allCards = useMemo(() => {
    const combinedCards = [...activeCards, ...expiredCards];
    // Sắp xếp theo thời gian đăng ký mới nhất
    return combinedCards.sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }, [activeCards, expiredCards]);

  // Lọc thẻ theo tìm kiếm và trạng thái
  const filteredCards = useMemo(() => {
    let results = [...allCards];

    // Lọc theo trạng thái
    if (statusFilter === "active") {
      results = results.filter((card) =>
        isAfter(new Date(card.expirationDate), new Date())
      );
    } else if (statusFilter === "expired") {
      results = results.filter(
        (card) => !isAfter(new Date(card.expirationDate), new Date())
      );
    }

    // Lọc theo tìm kiếm
    if (searchTerm.trim() !== "") {
      const lowercasedSearchTerm = searchTerm.toLowerCase();

      results = results.filter((card) => {
        if (searchType === "licensePlate") {
          return card.vehicle.licensePlate
            .toLowerCase()
            .includes(lowercasedSearchTerm);
        } else if (searchType === "customerName") {
          return card.customer.name
            .toLowerCase()
            .includes(lowercasedSearchTerm);
        } else if (searchType === "phoneNumber") {
          return card.customer.phoneNumber.includes(searchTerm);
        }
        return false;
      });
    }

    return results;
  }, [allCards, statusFilter, searchTerm, searchType]);

  // Fetch dữ liệu từ API khi component mount
  useEffect(() => {
    async function fetchMonthlyCards() {
      try {
        setLoading(true);

        // Fetch thẻ còn hạn
        const activeCardApiUrl = buildApiUrl(
          API_ENDPOINTS.MONTHLY_CARDS.ACTIVE
        );
        const activeCardsResponse = await fetchWithAuth<ApiResponse>(
          activeCardApiUrl
        );

        // Fetch thẻ hết hạn
        const expiredCardApiUrl = buildApiUrl(
          API_ENDPOINTS.MONTHLY_CARDS.EXPIRE
        );
        const expiredCardsResponse = await fetchWithAuth<ApiResponse>(
          expiredCardApiUrl
        );

        if (activeCardsResponse?.code === 1000) {
          setActiveCards(activeCardsResponse.result || []);
        } else {
          toast.error("Không thể lấy danh sách thẻ tháng còn hạn");
        }

        if (expiredCardsResponse?.code === 1000) {
          setExpiredCards(expiredCardsResponse.result || []);
        } else {
          toast.error("Không thể lấy danh sách thẻ tháng hết hạn");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Không thể tải danh sách thẻ tháng. Vui lòng thử lại sau.");
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }

    fetchMonthlyCards();
  }, [fetchWithAuth]);

  // Cập nhật tổng số trang khi filteredCards thay đổi
  useEffect(() => {
    setTotalPages(
      Math.max(1, Math.ceil(filteredCards.length / ITEMS_PER_PAGE))
    );
    // Reset về trang 1 khi danh sách lọc thay đổi
    setCurrentPage(1);
  }, [filteredCards]);

  // Lấy các bản ghi trên trang hiện tại
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCards.slice(startIndex, endIndex);
  };

  // Format thời gian
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Format thời gian đầy đủ
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm - dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Kiểm tra thẻ còn hạn hay đã hết hạn
  const isCardActive = (expirationDate: string) => {
    return isAfter(new Date(expirationDate), new Date());
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

  // Xử lý chuyển trang
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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

  return (
    <div className="w-full px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lịch sử đăng ký thẻ tháng</h1>
        <p className="text-gray-500">
          Quản lý và xem lịch sử đăng ký thẻ tháng của khách hàng
        </p>
      </div>

      {/* Hiển thị lỗi nếu có */}
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
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng số thẻ tháng
                </p>
                <p className="text-2xl font-bold">{allCards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Còn hạn</p>
                <p className="text-2xl font-bold">{activeCards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between pt-3">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-amber-100 mr-4">
                <Ban className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hết hạn</p>
                <p className="text-2xl font-bold">{expiredCards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng dữ liệu */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle>
                {isSearching
                  ? `Kết quả tìm kiếm (${filteredCards.length})`
                  : `Tất cả thẻ tháng (${filteredCards.length})`}
              </CardTitle>
              <CardDescription>
                {isSearching
                  ? `Đang hiển thị kết quả tìm kiếm cho "${searchTerm}"`
                  : statusFilter === "all"
                  ? "Hiển thị tất cả thẻ tháng (còn hạn và hết hạn)"
                  : statusFilter === "active"
                  ? "Chỉ hiển thị thẻ tháng còn hạn"
                  : "Chỉ hiển thị thẻ tháng đã hết hạn"}
              </CardDescription>
            </div>

            {/* Bộ lọc và tìm kiếm */}
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 items-end">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm"
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsSearching(e.target.value.trim() !== "");
                  }}
                />
              </div>

              <Select
                value={searchType}
                onValueChange={(value) => setSearchType(value as any)}
              >
                <SelectTrigger className="w-full md:w-[170px] h-10">
                  <SelectValue placeholder="Tìm theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licensePlate">Biển số xe</SelectItem>
                  <SelectItem value="customerName">Tên khách hàng</SelectItem>
                  <SelectItem value="phoneNumber">Số điện thoại</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger className="w-full md:w-[140px] h-10">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Còn hạn</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>

              {isSearching && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearchTerm("");
                    setIsSearching(false);
                  }}
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
                  <TableHead className="font-medium w-[10%] text-center">
                    Biển số xe
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Khách hàng
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Loại xe
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Ngày đăng ký
                  </TableHead>
                  <TableHead className="font-medium w-[15%] text-center">
                    Ngày hết hạn
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Phí (VNĐ)
                  </TableHead>
                  <TableHead className="font-medium w-[10%] text-center">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="h-10 w-10 mb-2 opacity-20" />
                        <span>Không tìm thấy thẻ tháng nào</span>
                        {(isSearching || statusFilter !== "all") && (
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setIsSearching(false);
                                setStatusFilter("all");
                              }}
                            >
                              Xóa bộ lọc
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRecords.map((card, index) => {
                    const isActive = isCardActive(card.expirationDate);
                    return (
                      <TableRow
                        key={card.id}
                        className={
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }
                      >
                        <TableCell className="text-center text-slate-500">
                          {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Car className="h-4 w-4 text-slate-400" />
                            {card.vehicle.licensePlate}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {card.vehicle.brand} • {card.vehicle.color}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <User className="h-4 w-4 text-slate-400" />
                            {card.customer.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {card.customer.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 justify-center">
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                card.vehicle.type.name === "Bicycle"
                                  ? "bg-yellow-500"
                                  : card.vehicle.type.name === "Motorbike"
                                  ? "bg-blue-500"
                                  : card.vehicle.type.name === "Car"
                                  ? "bg-purple-500"
                                  : "bg-green-500"
                              }`}
                            ></span>
                            {card.vehicle.type.name === "Bicycle"
                              ? "Xe đạp"
                              : card.vehicle.type.name === "Motorbike"
                              ? "Xe máy"
                              : card.vehicle.type.name === "Scooter"
                              ? "Xe tay ga"
                              : card.vehicle.type.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-center">
                          {formatDateTime(card.issueDate)}
                          <div className="text-xs text-slate-500 mt-1">
                            Nhân viên: {card.createBy.username}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-center">
                          {formatDate(card.expirationDate)}
                        </TableCell>
                        <TableCell className="font-medium text-center">
                          {card.payment.amount.toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            {isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                                Còn hạn
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
                                Hết hạn
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
