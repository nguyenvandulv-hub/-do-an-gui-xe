package com.group1.parking_management.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.group1.parking_management.common.PaymentType;
import com.group1.parking_management.dto.request.MissingReportRequest;
import com.group1.parking_management.dto.response.MissingReportResponse;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.MissingReport;
import com.group1.parking_management.entity.ParkingRecord;
import com.group1.parking_management.entity.ParkingRecordHistory;
import com.group1.parking_management.entity.Payment;
import com.group1.parking_management.entity.VehicleType;
import com.group1.parking_management.exception.AppException;
import com.group1.parking_management.exception.ErrorCode;
import com.group1.parking_management.mapper.MissingReportMapper;
import com.group1.parking_management.repository.AccountRepository;
import com.group1.parking_management.repository.MissingReportRepository;
import com.group1.parking_management.repository.ParkingRecordHistoryRepository;
import com.group1.parking_management.repository.ParkingRecordRepository;
import com.group1.parking_management.repository.PaymentRepository;
import com.group1.parking_management.repository.VehicleTypeRepository;
import com.group1.parking_management.service.MissingReportService;
import com.group1.parking_management.service.ParkingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MissingReportServiceImpl implements MissingReportService {
    private final ParkingService parkingService;
    private final AccountRepository accountRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final ParkingRecordRepository parkingRecordRepository;
    private final ParkingRecordHistoryRepository parkingRecordHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final MissingReportRepository missingReportRepository;
    private final MissingReportMapper missingReportMapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public MissingReportResponse createMissingReport(MissingReportRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account staff = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));

        ParkingRecord record = null;
        if (!StringUtils.hasText(request.getLicensePlate()) && !StringUtils.hasText(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFICATION_ERROR);
        } else if (StringUtils.hasText(request.getLicensePlate())) {
            record = parkingRecordRepository.findByLicensePlate(request.getLicensePlate())
                    .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_IN_PARKING));
        } else {
            record = parkingRecordRepository.findByIdentifier(request.getIdentifier())
                    .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_IN_PARKING));
        }

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_VEHICLE_TYPE_NOT_FOUND));

        if (vehicleType != record.getVehicleType()) {
            throw new AppException(ErrorCode.MONTHLY_VEHICLE_TYPE_NOT_EQUALS_TO_RECORD);
        }

        Payment payment = Payment.builder()
                .amount(50000)
                .createAt(LocalDateTime.now())
                .paymentType(PaymentType.MISSING)
                .build();
        paymentRepository.save(payment);

        ParkingRecordHistory history = parkingRecordHistoryRepository
                .save(parkingService.recordToHistory(record, payment, staff));
        parkingRecordRepository.delete(record);

        MissingReport report = MissingReport.builder()
                .record(history)
                .licensePlate(request.getLicensePlate())
                .vehicleType(vehicleType)
                .name(request.getName())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .brand(request.getBrand())
                .color(request.getColor())
                .identification(request.getIdentification())
                .payment(payment)
                .createBy(staff)
                .createAt(LocalDateTime.now())
                .build();

        return missingReportMapper.toReportResponse(missingReportRepository.save(report));

    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<MissingReportResponse> getAllMissingReport() {
        return missingReportRepository.findAllByOrderByCreateAtDesc().stream()
                .map(missingReportMapper::toReportResponse).toList();
    }

}
