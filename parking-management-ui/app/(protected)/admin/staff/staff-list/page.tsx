"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Loader2, MoreVertical, Search, User } from "lucide-react";
import { toast } from "sonner";
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
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

// Khai báo các kiểu dữ liệu
interface Staff {
  accountId: string;
  username: string;
  identification: string;
  name: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phoneNumber: string;
  address: string;
  email: string;
  isActive: boolean;
}

interface ApiResponse {
  code: number;
  result: Staff[];
  message: string;
}

const ITEMS_PER_PAGE = 10;

export default function StaffList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State to manage staff status
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [processingStatus, setProcessingStatus] = useState(false);

  useEffect(() => {
    fetchStaffList();
  }, []);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy token xác thực từ localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
      }

      // API call thực tế (thay đổi URL khi API sẵn sàng)
      const apiUrl = buildApiUrl(API_ENDPOINTS.ADMIN.STAFFS);
      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data: ApiResponse = await response.json();

      if (data.code === 1000) {
        // Sắp xếp nhân viên theo username (có thể thay đổi sau)
        const sortedStaff = [...data.result];

        setStaffList(sortedStaff);
        setTotalPages(Math.ceil(sortedStaff.length / ITEMS_PER_PAGE));
      } else {
        throw new Error(
          "Lỗi khi lấy danh sách nhân viên: " +
            (data.message || "Không xác định")
        );
      }
    } catch (err) {
      console.error("Error fetching staff list:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải dữ liệu nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!selectedStaff) return;

    try {
      setProcessingStatus(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn");
        setShowStatusDialog(false);
        return;
      }

      // Chuẩn bị request body với thông tin staff hiện tại nhưng đảo ngược isActive
      const requestBody = {
        username: selectedStaff.username,
        identification: selectedStaff.identification,
        name: selectedStaff.name,
        dob: selectedStaff.dob,
        gender: selectedStaff.gender,
        phoneNumber: selectedStaff.phoneNumber,
        address: selectedStaff.address,
        email: selectedStaff.email,
        isActive: !selectedStaff.isActive, // Đảo ngược trạng thái isActive
      };

      // Gọi API để cập nhật trạng thái
      const response = await fetch(
        `http://localhost:8080/api/admin/staffs/${selectedStaff.accountId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! Status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.code === 1000) {
        // Cập nhật lại dữ liệu trong danh sách
        setStaffList((prevList) =>
          prevList.map((staff) =>
            staff.accountId === selectedStaff.accountId
              ? { ...staff, isActive: !staff.isActive }
              : staff
          )
        );

        toast.success(
          `Đã ${
            selectedStaff.isActive ? "vô hiệu hóa" : "kích hoạt"
          } tài khoản ${selectedStaff.username}`
        );
      } else {
        throw new Error(data.message || "Không thể thay đổi trạng thái");
      }
    } catch (err) {
      console.error("Error toggling staff status:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Không thể thay đổi trạng thái nhân viên"
      );
    } finally {
      setProcessingStatus(false);
      setShowStatusDialog(false);
    }
  };

  // Lọc nhân viên theo từ khóa tìm kiếm
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phoneNumber.includes(searchTerm) ||
      staff.identification.includes(searchTerm)
  );

  // Lấy data cho trang hiện tại
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStaff.slice(startIndex, endIndex);
  };

  // Tính toán các số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  };

  const handleToggleStatus = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowStatusDialog(true);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const currentData = getPaginatedData();
  const pageNumbers = getPageNumbers();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header with title and add button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Danh sách nhân viên</h1>
            <p className="text-gray-500 mt-1">
              Quản lý tất cả nhân viên trong hệ thống
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-600 font-medium flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Staff table card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <CardTitle>Tất cả nhân viên ({filteredStaff.length})</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Tìm nhân viên..."
                  className="pl-9 pr-4"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800">
                    <TableHead className="font-medium py-3 text-center w-[12%] whitespace-nowrap">
                      Tên nhân viên
                    </TableHead>
                    <TableHead className="font-medium py-3 text-center w-[12%] whitespace-nowrap">
                      CCCD
                    </TableHead>
                    <TableHead className="font-medium py-3 text-center w-[10%] whitespace-nowrap">
                      Username
                    </TableHead>
                    <TableHead className="font-medium py-3 hidden md:table-cell text-center w-[15%] whitespace-nowrap">
                      Email
                    </TableHead>
                    <TableHead className="font-medium py-3 hidden md:table-cell text-center w-[10%] whitespace-nowrap">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="font-medium py-3 text-center w-[10%] whitespace-nowrap">
                      Vai trò
                    </TableHead>
                    <TableHead className="font-medium py-3 text-center w-[10%] whitespace-nowrap">
                      Trạng thái
                    </TableHead>
                    <TableHead className="font-medium py-3 hidden md:table-cell text-center w-[10%] whitespace-nowrap">
                      Ngày sinh
                    </TableHead>
                    <TableHead className="font-medium py-3 text-center w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-10 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <User className="h-10 w-10 mb-2 opacity-20" />
                          <span>Không tìm thấy nhân viên nào</span>
                          <span className="text-sm mt-1">
                            {searchTerm
                              ? "Thử tìm kiếm với từ khóa khác"
                              : "Chưa có nhân viên nào trong hệ thống"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((staff) => (
                      <TableRow
                        key={staff.accountId}
                        className="hover:bg-slate-50/70"
                      >
                        {/* Tên nhân viên */}
                        <TableCell className="text-center w-[12%] truncate">
                          {staff.name}
                        </TableCell>

                        {/* CCCD */}
                        <TableCell className="text-center w-[12%] truncate">
                          {staff.identification}
                        </TableCell>

                        {/* Username */}
                        <TableCell className="text-center w-[10%] truncate">
                          {staff.username}
                        </TableCell>

                        {/* Email */}
                        <TableCell className="hidden md:table-cell text-center truncate w-[15%]">
                          {staff.email}
                        </TableCell>

                        {/* Số điện thoại */}
                        <TableCell className="hidden md:table-cell text-center truncate w-[10%]">
                          {staff.phoneNumber}
                        </TableCell>

                        {/* Vai trò */}
                        <TableCell className="text-center w-[10%]">
                          <div className="flex justify-center">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Nhân viên
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Trạng thái */}
                        <TableCell className="text-center w-[10%]">
                          <div className="flex justify-center">
                            {staff.isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Còn làm
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-800 border-gray-200"
                              >
                                Đã nghỉ
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Ngày sinh */}
                        <TableCell className="hidden md:table-cell text-center truncate w-[10%]">
                          {formatDate(staff.dob)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center w-[5%]">
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex h-8 w-8 p-0 data-[state=open]:bg-slate-100 items-center justify-center rounded-md hover:bg-slate-100">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Mở menu</span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-[160px]"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/admin/staff/${staff.accountId}/edit`
                                    )
                                  }
                                >
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={
                                    staff.isActive
                                      ? "text-red-600 focus:text-red-600"
                                      : "text-green-600 focus:text-green-600"
                                  }
                                  onClick={() => handleToggleStatus(staff)}
                                >
                                  {staff.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredStaff.length > ITEMS_PER_PAGE && (
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
                        {pageNumbers[pageNumbers.length - 1] <
                          totalPages - 1 && (
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
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
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

      {/* Dialog xác nhận thay đổi trạng thái */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStaff?.isActive
                ? "Vô hiệu hóa tài khoản"
                : "Kích hoạt tài khoản"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStaff?.isActive
                ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của nhân viên "${selectedStaff?.name}"? Nhân viên này sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.`
                : `Bạn có chắc chắn muốn kích hoạt lại tài khoản của nhân viên "${selectedStaff?.name}"? Nhân viên này sẽ có thể đăng nhập vào hệ thống sau khi được kích hoạt.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingStatus}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleStatus}
              disabled={processingStatus}
              className={
                selectedStaff?.isActive
                  ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
              }
            >
              {processingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : selectedStaff?.isActive ? (
                "Vô hiệu hóa"
              ) : (
                "Kích hoạt"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
