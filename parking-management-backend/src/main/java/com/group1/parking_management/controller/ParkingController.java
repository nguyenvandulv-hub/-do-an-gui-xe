package com.group1.parking_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.request.ParkingEntryRequest;
import com.group1.parking_management.dto.request.ParkingExitRequest;
import com.group1.parking_management.dto.request.UpdateCardRequest;
import com.group1.parking_management.dto.response.TodayTrafficResponse;
import com.group1.parking_management.dto.response.ParkingEntryResponse;
import com.group1.parking_management.dto.response.ParkingExitResponse;
import com.group1.parking_management.dto.response.VehicleTypeResponse;
import com.group1.parking_management.service.ParkingService;

import lombok.RequiredArgsConstructor;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║              FACADE PATTERN - TẦNG CONTROLLER           ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Đây là lớp "Mặt tiền" (Facade) của hệ thống đỗ xe.    ║
 * ║                                                          ║
 * ║  MỤC ĐÍCH:                                               ║
 * ║  - Cung cấp giao diện đơn giản cho Frontend (Client)    ║
 * ║  - Che giấu toàn bộ sự phức tạp bên trong Service       ║
 * ║                                                          ║
 * ║  CÁCH HOẠT ĐỘNG:                                         ║
 * ║  Frontend chỉ gọi 1 API endpoint đơn giản               ║
 * ║  → Controller nhận request                              ║
 * ║  → Chuyển thẳng cho ParkingService xử lý               ║
 * ║  → Trả về kết quả                                        ║
 * ║                                                          ║
 * ║  Frontend KHÔNG cần biết bên trong có:                  ║
 * ║  AccountRepository, PaymentRepository,                  ║
 * ║  ParkingRecordHistoryRepository, ParkingFeeStrategy...  ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@RestController
@RequestMapping("/parking")
@RequiredArgsConstructor
public class ParkingController {

    /**
     * [FACADE] Controller chỉ phụ thuộc vào 1 interface ParkingService duy nhất.
     * Không cần biết bên trong Service dùng bao nhiêu Repository hay component.
     */
    private final ParkingService parkingService;

    /**
     * [FACADE - Xe vào bãi]
     * Client gọi: POST /parking/entry
     * Bên trong Service tự động làm:
     *   1. Kiểm tra nhân viên đang đăng nhập
     *   2. Kiểm tra biển số chưa có trong bãi
     *   3. Kiểm tra xe có trong danh sách mất thẻ không
     *   4. Kiểm tra xe có thẻ tháng không (MONTHLY hay DAILY)
     *   5. Lấy thẻ gửi xe từ ParkingCardRepository
     *   6. Tạo bản ghi và lưu vào DB
     * → Client chỉ thấy: gửi request, nhận response. Đơn giản!
     */
    @PostMapping("/entry")
    public ApiResponse<ParkingEntryResponse> registerEntry(@RequestBody ParkingEntryRequest request) {
        return ApiResponse.<ParkingEntryResponse>builder()
                .result(parkingService.registerEntry(request))
                .build();
    }

    /**
     * [FACADE - Xe ra bãi & tính phí]
     * Client gọi: POST /parking/exit
     * Bên trong Service tự động làm:
     *   1. Lấy thông tin nhân viên từ SecurityContext
     *   2. Tìm bản ghi xe theo cardId + biển số
     *   3. Tính phí (dùng Strategy Pattern)
     *   4. Tạo và lưu Payment
     *   5. Chuyển record sang bảng lịch sử
     *   6. Xóa record khỏi bảng đỗ xe hiện tại
     * → Client chỉ thấy: gửi cardId + biển số, nhận về phí. Đơn giản!
     */
    @PostMapping("/exit")
    public ApiResponse<ParkingExitResponse> registerExit(@RequestBody ParkingExitRequest request) {
        return ApiResponse.<ParkingExitResponse>builder()
                .result(parkingService.processExit(request))
                .build();
    }

    /**
     * [FACADE - Xem danh sách xe đang đỗ]
     * Client gọi: GET /parking/records
     * Service tự truy vấn DB và map sang DTO trả về.
     */
    @GetMapping("/records")
    public ApiResponse<List<ParkingEntryResponse>> getAllRecordInParking() {
        return ApiResponse.<List<ParkingEntryResponse>>builder()
                .result(parkingService.getAllRecordInParking())
                .build();
    }

    /**
     * [FACADE - Cập nhật mã thẻ xe]
     * Client gọi: PUT /parking/records/{recordId}/card
     * Service kiểm tra thẻ mới có đang dùng không, rồi cập nhật.
     */
    @PutMapping("/records/{recordId}/card")
    public ApiResponse<ParkingEntryResponse> updateCardId(
            @PathVariable String recordId, 
            @RequestBody UpdateCardRequest request) {
        return ApiResponse.<ParkingEntryResponse>builder()
                .result(parkingService.updateCardId(recordId, request.getNewCardId()))
                .build();
    }

    /**
     * [FACADE - Lấy danh sách loại xe]
     * Client gọi: GET /parking/vehicle-types
     */
    @GetMapping("/vehicle-types")
    public ApiResponse<List<VehicleTypeResponse>> getAllVehicleType() {
        return ApiResponse.<List<VehicleTypeResponse>>builder()
                .result(parkingService.getAllVehicleType())
                .build();
    }

    /**
     * [FACADE - Lưu lượng xe hôm nay]
     * Client gọi: GET /parking/today
     * Service gộp dữ liệu từ 2 bảng (parking_record + parking_record_history)
     * rồi sắp xếp theo thời gian và trả về. Client không cần biết điều đó.
     */
    @GetMapping("/today")
    public ApiResponse<List<TodayTrafficResponse>> getTodayTraffic() {
        return ApiResponse.<List<TodayTrafficResponse>>builder()
                .result(parkingService.getTodayTraffic())
                .build();
    }

    /**
     * [FACADE - Xem lịch sử đỗ xe theo ngày]
     * Client gọi: GET /parking/record-history?month=6&day=18
     * Service tự tính khoảng thời gian và truy vấn bảng lịch sử.
     */
    @GetMapping("/record-history")
    public ApiResponse<List<ParkingExitResponse>> getParkingHistoryByDate(@RequestParam int month,
            @RequestParam int day) {
        return ApiResponse.<List<ParkingExitResponse>>builder()
                .result(parkingService.getParkingHistoryByDate(month, day))
                .build();
    }
}
