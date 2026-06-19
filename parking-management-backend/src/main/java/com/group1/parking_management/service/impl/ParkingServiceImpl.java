package com.group1.parking_management.service.impl;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.group1.parking_management.common.ParkingType;
import com.group1.parking_management.common.PaymentType;
import com.group1.parking_management.dto.request.ParkingEntryRequest;
import com.group1.parking_management.dto.request.ParkingExitRequest;
import com.group1.parking_management.dto.response.TodayTrafficResponse;
import com.group1.parking_management.dto.response.ParkingEntryResponse;
import com.group1.parking_management.dto.response.ParkingExitResponse;
import com.group1.parking_management.dto.response.VehicleTypeResponse;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.ActiveMonthlyRegistration;
import com.group1.parking_management.entity.ParkingCard;
import com.group1.parking_management.entity.ParkingRecord;
import com.group1.parking_management.entity.ParkingRecordHistory;
import com.group1.parking_management.entity.Payment;
import com.group1.parking_management.entity.Price;
import com.group1.parking_management.entity.VehicleType;
import com.group1.parking_management.exception.AppException;
import com.group1.parking_management.exception.ErrorCode;
import com.group1.parking_management.mapper.RecordMapper;
import com.group1.parking_management.mapper.VehicleTypeMapper;
import com.group1.parking_management.repository.AccountRepository;
import com.group1.parking_management.repository.ActiveMonthlyRegistrationRepository;
import com.group1.parking_management.repository.ParkingCardRepository;
import com.group1.parking_management.repository.MissingReportRepository;
import com.group1.parking_management.repository.ParkingRecordHistoryRepository;
import com.group1.parking_management.repository.ParkingRecordRepository;
import com.group1.parking_management.repository.PaymentRepository;
import com.group1.parking_management.repository.PriceRepository;
import com.group1.parking_management.repository.VehicleTypeRepository;
import com.group1.parking_management.service.ConfigService;
import com.group1.parking_management.service.ParkingService;
import com.group1.parking_management.strategy.ParkingFeeStrategy;
import com.group1.parking_management.util.SystemLogger;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           FACADE PATTERN - TẦNG SERVICE (IMPLEMENTATION)        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Đây là nơi THỰC SỰ xử lý logic - phần "ẩn" của Facade.        ║
 * ║                                                                  ║
 * ║  TẠI SAO LÀ FACADE?                                              ║
 * ║  Lớp này tích hợp và điều phối NHIỀU hệ thống con:             ║
 * ║  - AccountRepository      : lấy thông tin nhân viên             ║
 * ║  - ParkingRecordRepository: quản lý xe đang đỗ                  ║
 * ║  - ActiveMonthlyRegistrationRepository: kiểm tra thẻ tháng      ║
 * ║  - ParkingCardRepository  : quản lý thẻ vật lý                  ║
 * ║  - MissingReportRepository: kiểm tra danh sách xe mất thẻ       ║
 * ║  - PriceRepository        : lấy bảng giá đỗ xe                  ║
 * ║  - PaymentRepository      : lưu hóa đơn thanh toán              ║
 * ║  - ParkingRecordHistoryRepository: lưu lịch sử                  ║
 * ║  - ParkingFeeStrategy     : tính phí (Strategy Pattern)         ║
 * ║  - SystemLogger           : ghi log (Singleton Pattern)         ║
 * ║                                                                  ║
 * ║  → Controller chỉ gọi 1 method, Service lo tất cả!             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ParkingServiceImpl implements ParkingService {

    // ══════════════════════════════════════════════════════════════
    // CÁC HỆ THỐNG CON được Facade tích hợp và điều phối
    // Controller KHÔNG biết những dependency này tồn tại
    // ══════════════════════════════════════════════════════════════
    private final ParkingRecordRepository parkingRecordRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ActiveMonthlyRegistrationRepository activeMonthlyRegistrationRepository;
    private final AccountRepository accountRepository;
    private final ParkingCardRepository parkingCardRepository;
    private final RecordMapper recordMapper;
    private final PriceRepository priceRepository;
    private final PaymentRepository paymentRepository;
    private final ParkingRecordHistoryRepository parkingRecordHistoryRepository;
    private final VehicleTypeMapper vehicleTypeMapper;
    private final MissingReportRepository missingReportRepository;
    private final ConfigService configService;

    /**
     * [FACADE - SUB-SYSTEM] Danh sách các chiến lược tính phí.
     * Đây là Strategy Pattern được nhúng bên trong Facade.
     * Spring tự động inject tất cả class implements ParkingFeeStrategy.
     */
    private final List<ParkingFeeStrategy> feeStrategies;

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 1: registerEntry - Ghi nhận xe vào bãi
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Ghi nhận xe vào bãi đỗ xe.
     *
     * Nhìn từ phía Controller: chỉ là 1 method đơn giản.
     * Thực tế bên trong thực hiện 6 bước kiểm tra + tạo record:
     *
     * Bước 1: Xác định nhân viên đang thao tác (từ JWT token)
     * Bước 2: Validate biển số / mã định danh đầu vào
     * Bước 3: Kiểm tra biển số chưa có trong bãi (tránh trùng)
     * Bước 4: Kiểm tra xe có trong danh sách mất thẻ không
     * Bước 5: Kiểm tra thẻ tháng → tự động xác định loại vé (MONTHLY/DAILY)
     * Bước 6: Tạo bản ghi ParkingRecord và lưu vào DB
     */
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ParkingEntryResponse registerEntry(ParkingEntryRequest request) {
        // Bước 1: Lấy username từ SecurityContext (JWT token đã được giải mã)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account staff = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));

        // Bước 2: Bắt buộc phải có ít nhất 1 trong 2: biển số hoặc mã định danh
        if (!StringUtils.hasText(request.getLicensePlate()) && !StringUtils.hasText(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFICATION_ERROR);
        }

        // Bước 3: Kiểm tra biển số chưa có trong bãi (không cho vào 2 lần)
        if (StringUtils.hasText(request.getLicensePlate())
                && parkingRecordRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new AppException(ErrorCode.PARKING_LICENSE_PLATE_EXISTED);
        }
        if (StringUtils.hasText(request.getIdentifier())
                && parkingRecordRepository.existsByIdentifier(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFIER_EXISTED);
        }
        
        // Bước 4: Kiểm tra xe có trong danh sách đen (từng làm mất thẻ)
        if (StringUtils.hasText(request.getLicensePlate()) 
                && missingReportRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new AppException(ErrorCode.VEHICLE_BLACKLISTED);
        }

        // Bước 5a: Kiểm tra xe có thẻ tháng đang hiệu lực không
        boolean hasMonthlyCard = activeMonthlyRegistrationRepository.existsByLicensePlate(request.getLicensePlate());
        String finalVehicleTypeId = request.getVehicleTypeId();

        // Bước 5b: Nếu có thẻ tháng nhưng nhân viên chọn sai loại xe → tự động sửa
        if (hasMonthlyCard) {
            boolean isVehicleTypeMatch = activeMonthlyRegistrationRepository.existsByLicensePlateAndVehicleTypeId(
                request.getLicensePlate(), request.getVehicleTypeId());
            if (!isVehicleTypeMatch) {
                ActiveMonthlyRegistration reg = activeMonthlyRegistrationRepository.findFirstByVehicle_LicensePlate(request.getLicensePlate());
                if (reg != null && reg.getVehicle() != null && reg.getVehicle().getType() != null) {
                    finalVehicleTypeId = reg.getVehicle().getType().getId();
                }
            }
        }
        
        // Bước 5c: Xác định loại vé: có thẻ tháng → MONTHLY, không có → DAILY
        ParkingType parkingType = hasMonthlyCard ? ParkingType.MONTHLY : ParkingType.DAILY;

        // Bước 6: Kiểm tra thẻ vật lý (card) chưa được sử dụng
        if (parkingRecordRepository.existsByCard_CardId(request.getCardId())) {
            throw new AppException(ErrorCode.PARKING_CARD_IN_USED);
        }

        // Lấy thẻ vật lý từ DB
        ParkingCard parkingCard = parkingCardRepository.findById(request.getCardId())
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_CARD_NOT_FOUND));

        // Lấy loại xe từ DB
        VehicleType vehicleType = vehicleTypeRepository.findById(finalVehicleTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_VEHICLE_TYPE_NOT_FOUND));

        // Tạo bản ghi đỗ xe và lưu vào DB
        ParkingRecord parkingRecord = ParkingRecord.builder()
                .licensePlate(request.getLicensePlate())
                .identifier(request.getIdentifier())
                .vehicleType(vehicleType)
                .card(parkingCard)
                .entryTime(LocalDateTime.now())
                .type(parkingType)
                .staffIn(staff)
                .build();

        return recordMapper.toParkingEntryResponse(parkingRecordRepository.save(parkingRecord));
    }

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 2: processExit - Ghi nhận xe ra và tính phí
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Ghi nhận xe ra bãi và tính phí tự động.
     *
     * Nhìn từ phía Controller: chỉ là 1 method đơn giản.
     * Thực tế bên trong thực hiện 6 bước:
     *
     * Bước 1: Xác định nhân viên đang thao tác (từ JWT token)
     * Bước 2: Tìm bản ghi xe theo cardId + biển số/định danh
     * Bước 3: Tính phí → dùng Strategy Pattern (DailyFeeStrategy / MonthlyFeeStrategy)
     * Bước 4: Tạo và lưu hóa đơn thanh toán (Payment)
     * Bước 5: Chuyển record sang bảng lịch sử (ParkingRecordHistory)
     * Bước 6: Xóa record khỏi bảng xe đang đỗ (parking_record)
     */
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ParkingExitResponse processExit(ParkingExitRequest request) {
        // Bước 1: Lấy thông tin nhân viên đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account staff = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));

        // Validate: phải có biển số hoặc mã định danh
        if (!StringUtils.hasText(request.getLicensePlate()) && !StringUtils.hasText(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFICATION_ERROR);
        }

        Integer cardId = request.getCardId();

        // Bước 2: Tìm bản ghi xe đang đỗ theo cardId + biển số (hoặc định danh)
        Optional<ParkingRecord> parkingRecordOpt = StringUtils.hasText(request.getLicensePlate())
                ? parkingRecordRepository.findByLicensePlateAndCard_CardId(request.getLicensePlate(), cardId)
                : parkingRecordRepository.findByIdentifierAndCard_CardId(request.getIdentifier(), cardId);

        ParkingRecord parkingRecord = parkingRecordOpt
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_RECORD_NOT_FOUND));

        // Bước 3: Tính phí đỗ xe → ủy quyền cho Strategy Pattern
        // (DailyFeeStrategy nếu vé ngày, MonthlyFeeStrategy nếu thẻ tháng → phí = 0)
        int fee = calculateParkingFee(parkingRecord);

        // Bước 4: Tạo bản ghi thanh toán và lưu vào DB
        Payment payment = Payment.builder()
                .amount(fee)
                .createAt(LocalDateTime.now())
                .paymentType(PaymentType.PARKING)
                .build();
        paymentRepository.save(payment);

        // Bước 5: Chuyển dữ liệu sang bảng lịch sử đỗ xe
        ParkingRecordHistory recordHistory = parkingRecordHistoryRepository
                .save(recordToHistory(parkingRecord, payment, staff));

        // Bước 6: Xóa bản ghi khỏi bảng xe đang đỗ (giải phóng chỗ)
        parkingRecordRepository.delete(parkingRecord);

        return recordMapper.toParkingExitResponse(recordHistory);
    }

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 3: getAllRecordInParking
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Lấy danh sách tất cả xe đang đỗ trong bãi.
     * Truy vấn bảng parking_record và map sang DTO.
     */
    @Override
    public List<ParkingEntryResponse> getAllRecordInParking() {
        return parkingRecordRepository.findAll().stream()
                .map(recordMapper::toParkingEntryResponse).toList();
    }

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 4: updateCardId
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Cập nhật mã thẻ cho lượt đỗ xe (khi đổi thẻ vật lý).
     * Kiểm tra thẻ mới chưa được dùng trước khi cập nhật.
     */
    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ParkingEntryResponse updateCardId(String recordId, Integer newCardId) {
        // Tìm bản ghi đỗ xe cần cập nhật
        ParkingRecord record = parkingRecordRepository.findById(recordId)
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_RECORD_NOT_FOUND));

        // Nếu thẻ mới = thẻ cũ → không cần làm gì
        if (record.getCard().getCardId().equals(newCardId)) {
            return recordMapper.toParkingEntryResponse(record);
        }

        // Kiểm tra thẻ mới chưa đang được dùng bởi xe khác
        if (parkingRecordRepository.existsByCard_CardId(newCardId)) {
            throw new AppException(ErrorCode.PARKING_CARD_IN_USED);
        }

        // Lấy thẻ mới từ DB và cập nhật
        ParkingCard newCard = parkingCardRepository.findById(newCardId)
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_CARD_NOT_FOUND));

        record.setCard(newCard);
        return recordMapper.toParkingEntryResponse(parkingRecordRepository.save(record));
    }

    // ══════════════════════════════════════════════════════════════════
    // HELPER METHOD: calculateParkingFee - Tính phí (dùng Strategy Pattern)
    // ══════════════════════════════════════════════════════════════════

    /**
     * [HELPER - Strategy Pattern bên trong Facade]
     * Tính phí đỗ xe bằng cách tìm chiến lược phù hợp.
     *
     * Cách hoạt động:
     * - Duyệt qua danh sách feeStrategies (được Spring inject)
     * - Tìm strategy phù hợp với loại vé (DAILY hoặc MONTHLY)
     * - Gọi calculateFee() của strategy đó
     *
     * Strategy hiện có:
     * - DailyFeeStrategy  → tính phí theo ca ngày/đêm
     * - MonthlyFeeStrategy → trả về 0đ (thẻ tháng miễn phí mỗi lượt)
     *
     * [SINGLETON] SystemLogger.getInstance() được gọi ở đây.
     */
    public int calculateParkingFee(ParkingRecord record) {
        // Dùng Singleton Pattern để ghi log
        SystemLogger.getInstance().log("Calculating fee for record: " + record.getRecordId());

        // Dùng Strategy Pattern để tính phí
        return feeStrategies.stream()
                .filter(strategy -> strategy.supports(record.getType())) // tìm strategy phù hợp
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.SYSTEM_INTERNAL_ERROR))
                .calculateFee(record); // tính phí
    }

    // ══════════════════════════════════════════════════════════════════
    // HELPER METHOD: recordToHistory - Chuyển record sang lịch sử
    // ══════════════════════════════════════════════════════════════════

    /**
     * [HELPER] Tạo bản ghi lịch sử từ bản ghi đỗ xe hiện tại.
     * Được gọi khi xe ra bãi (trong processExit) hoặc xử lý mất thẻ.
     */
    public ParkingRecordHistory recordToHistory(ParkingRecord record, Payment payment, Account staff) {
        return ParkingRecordHistory.builder()
                .licensePlate(record.getLicensePlate())
                .identifier(record.getIdentifier())
                .vehicleType(record.getVehicleType())
                .card(record.getCard())
                .entryTime(record.getEntryTime())
                .exitTime(LocalDateTime.now()) // ghi nhận thời gian xe ra = thời điểm hiện tại
                .type(record.getType())
                .payment(payment)
                .staffIn(record.getStaffIn())  // nhân viên lúc xe vào
                .staffOut(staff)               // nhân viên lúc xe ra (người đang thao tác)
                .build();
    }

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 5: getAllVehicleType
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Lấy danh sách tất cả loại xe hỗ trợ.
     * (xe đạp, xe máy số, xe máy tay ga...)
     */
    @Override
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public List<VehicleTypeResponse> getAllVehicleType() {
        return vehicleTypeRepository.findAll().stream().map(vehicleTypeMapper::toVehicleTypeResponse).toList();
    }

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 6: getTodayTraffic
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Lấy lưu lượng xe vào/ra trong ngày hôm nay.
     *
     * Phức tạp bên trong nhưng Controller chỉ thấy 1 method:
     * - Truy vấn bảng parking_record (xe vào chưa ra)
     * - Truy vấn bảng parking_record_history (xe đã ra)
     * - Gộp 2 danh sách, phân loại ENTRY/EXIT
     * - Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
     */
    @Override
    public List<TodayTrafficResponse> getTodayTraffic() {
        LocalDate today = LocalDate.now();
        List<TodayTrafficResponse> result = new ArrayList<>();

        // get start time and end time of day
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        // Lấy xe vào trong ngày từ bảng parking_record (xe chưa ra)
        List<ParkingRecord> currentRecords = parkingRecordRepository.findByEntryTimeBetween(startOfDay, endOfDay);

        // Tạo DTO cho từng sự kiện xe vào (ENTRY)
        for (ParkingRecord record : currentRecords) {
            TodayTrafficResponse dto = TodayTrafficResponse.builder()
                    .licensePlate(
                            StringUtils.hasText(record.getLicensePlate()) ? record.getLicensePlate() : record.getIdentifier())
                    .vehicleType(record.getVehicleType().getName())
                    .ticketType(record.getType().toString())
                    .timestamp(record.getEntryTime())
                    .eventType("ENTRY")
                    .build();

            result.add(dto);
        }

        // Lấy xe đã ra trong ngày từ bảng parking_record_history
        List<ParkingRecordHistory> historyRecords = parkingRecordHistoryRepository.findByExitTimeBetween(
                startOfDay, endOfDay);

        for (ParkingRecordHistory record : historyRecords) {
            // Nếu xe vào trong ngày hôm nay → thêm cả sự kiện ENTRY
            if (record.getEntryTime().isAfter(startOfDay) && record.getEntryTime().isBefore(endOfDay)) {
                TodayTrafficResponse entryDto = TodayTrafficResponse.builder()
                        .licensePlate(StringUtils.hasText(record.getLicensePlate()) ? record.getLicensePlate()
                                : record.getIdentifier())
                        .vehicleType(record.getVehicleType().getName())
                        .ticketType(record.getType().toString())
                        .timestamp(record.getEntryTime())
                        .eventType("ENTRY")
                        .build();

                result.add(entryDto);
            }
            // Thêm sự kiện EXIT cho xe đã ra
            TodayTrafficResponse exitDto = TodayTrafficResponse.builder()
                    .licensePlate(
                            StringUtils.hasText(record.getLicensePlate()) ? record.getLicensePlate() : record.getIdentifier())
                    .vehicleType(record.getVehicleType().getName())
                    .ticketType(record.getType().toString())
                    .timestamp(record.getExitTime())
                    .eventType("EXIT")
                    .build();

            result.add(exitDto);
        }

        // Sắp xếp theo thời gian giảm dần (sự kiện mới nhất hiển thị đầu tiên)
        result.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return result;
    }

    // ══════════════════════════════════════════════════════════════════
    // FACADE METHOD 7: getParkingHistoryByDate
    // ══════════════════════════════════════════════════════════════════

    /**
     * [FACADE] Lấy lịch sử đỗ xe theo tháng và ngày (chỉ Admin).
     * Service tự tính khoảng thời gian (startOfDay → endOfDay)
     * và truy vấn bảng lịch sử, Controller không cần biết.
     */
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<ParkingExitResponse> getParkingHistoryByDate(int month, int day) {
        int currentYear = LocalDate.now().getYear();

        // Tính ngày cụ thể từ tham số month + day
        LocalDate targetDate = LocalDate.of(currentYear, month, day);

        // Xác định khoảng thời gian trong ngày đó
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(23, 59, 59);

        // Truy vấn và map sang DTO
        List<ParkingRecordHistory> historyRecord = parkingRecordHistoryRepository.findByExitTimeBetween(startOfDay,
                endOfDay);
        return historyRecord.stream().map(recordMapper::toParkingExitResponse).toList();
    }

}
