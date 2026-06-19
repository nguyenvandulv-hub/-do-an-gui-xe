package com.group1.parking_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.ParkingEntryRequest;
import com.group1.parking_management.dto.request.ParkingExitRequest;
import com.group1.parking_management.dto.response.TodayTrafficResponse;
import com.group1.parking_management.dto.response.ParkingEntryResponse;
import com.group1.parking_management.dto.response.ParkingExitResponse;
import com.group1.parking_management.dto.response.VehicleTypeResponse;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.ParkingRecord;
import com.group1.parking_management.entity.ParkingRecordHistory;
import com.group1.parking_management.entity.Payment;

/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         FACADE PATTERN - INTERFACE (HỢP ĐỒNG)           ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  Interface này là "bản hợp đồng" của Facade.            ║
 * ║                                                          ║
 * ║  VAI TRÒ:                                                ║
 * ║  - Định nghĩa những gì Facade CÓ THỂ LÀM (method)       ║
 * ║  - Che giấu hoàn toàn lớp thực thi (ParkingServiceImpl) ║
 * ║  - Controller chỉ biết Interface này, không biết Impl   ║
 * ║                                                          ║
 * ║  NGUYÊN LÝ SOLID liên quan:                             ║
 * ║  - DIP: Lớp cao (Controller) phụ thuộc vào abstraction  ║
 * ║         (Interface) thay vì implementation cụ thể        ║
 * ║  - ISP: Interface chỉ khai báo method cần thiết         ║
 * ╚══════════════════════════════════════════════════════════╝
 */
@Service
public interface ParkingService {

    /**
     * [FACADE METHOD] Ghi nhận xe vào bãi.
     * Controller gọi method này → tất cả logic phức tạp được
     * xử lý bên trong ParkingServiceImpl (kiểm tra thẻ tháng,
     * kiểm tra blacklist, tạo record...).
     */
    ParkingEntryResponse registerEntry(ParkingEntryRequest request);

    /**
     * [FACADE METHOD] Ghi nhận xe ra và tính phí.
     * Controller gọi method này → Service lo toàn bộ:
     * tính phí (Strategy Pattern), lưu payment, chuyển history...
     */
    public ParkingExitResponse processExit(ParkingExitRequest request);

    /**
     * [FACADE METHOD] Lấy danh sách tất cả xe đang đỗ trong bãi.
     */
    public List<ParkingEntryResponse> getAllRecordInParking();

    /**
     * [FACADE METHOD] Cập nhật mã thẻ cho lượt đỗ xe.
     */
    public ParkingEntryResponse updateCardId(String recordId, Integer newCardId);

    /**
     * [HELPER METHOD - nội bộ] Chuyển ParkingRecord sang ParkingRecordHistory.
     * Được dùng bên trong Service khi xe ra bãi.
     */
    public ParkingRecordHistory recordToHistory(ParkingRecord record, Payment payment, Account staff);

    /**
     * [FACADE METHOD] Lấy danh sách tất cả loại xe hỗ trợ.
     */
    public List<VehicleTypeResponse> getAllVehicleType();

    /**
     * [FACADE METHOD] Lấy lưu lượng xe vào/ra trong ngày hôm nay.
     * Bên trong gộp dữ liệu từ 2 bảng: parking_record + parking_record_history.
     */
    public List<TodayTrafficResponse> getTodayTraffic();

    /**
     * [FACADE METHOD] Lấy lịch sử đỗ xe theo tháng và ngày.
     */
    public List<ParkingExitResponse> getParkingHistoryByDate(int month, int day);
}
