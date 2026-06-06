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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParkingServiceImpl implements ParkingService {
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

    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ParkingEntryResponse registerEntry(ParkingEntryRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account staff = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));

        if (!StringUtils.hasText(request.getLicensePlate()) && !StringUtils.hasText(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFICATION_ERROR);
        }
        if (StringUtils.hasText(request.getLicensePlate())
                && parkingRecordRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new AppException(ErrorCode.PARKING_LICENSE_PLATE_EXISTED);
        }
        if (StringUtils.hasText(request.getIdentifier())
                && parkingRecordRepository.existsByIdentifier(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFIER_EXISTED);
        }
        
        if (StringUtils.hasText(request.getLicensePlate()) 
                && missingReportRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new AppException(ErrorCode.VEHICLE_BLACKLISTED);
        }

        boolean hasMonthlyCard = activeMonthlyRegistrationRepository.existsByLicensePlate(request.getLicensePlate());
        ParkingType parkingType = hasMonthlyCard ? ParkingType.MONTHLY : ParkingType.DAILY;

        String cardId = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("ssmmHHddMMyy"));
        
        ParkingCard parkingCard = new ParkingCard();
        parkingCard.setCardId(cardId);
        parkingCard = parkingCardRepository.save(parkingCard);

        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_VEHICLE_TYPE_NOT_FOUND));

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

    @Override
    @Transactional
    @PreAuthorize("hasRole('STAFF')")
    public ParkingExitResponse processExit(ParkingExitRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account staff = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));

        if (!StringUtils.hasText(request.getLicensePlate()) && !StringUtils.hasText(request.getIdentifier())) {
            throw new AppException(ErrorCode.PARKING_IDENTIFICATION_ERROR);
        }

        String cardId = request.getCardId();

        Optional<ParkingRecord> parkingRecordOpt = StringUtils.hasText(request.getLicensePlate())
                ? parkingRecordRepository.findByLicensePlateAndCard_CardId(request.getLicensePlate(), cardId)
                : parkingRecordRepository.findByIdentifierAndCard_CardId(request.getIdentifier(), cardId);

        ParkingRecord parkingRecord = parkingRecordOpt
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_RECORD_NOT_FOUND));

        int fee = calculateParkingFee(parkingRecord);

        Payment payment = Payment.builder()
                .amount(fee)
                .createAt(LocalDateTime.now())
                .paymentType(PaymentType.PARKING)
                .build();
        paymentRepository.save(payment);

        ParkingRecordHistory recordHistory = parkingRecordHistoryRepository
                .save(recordToHistory(parkingRecord, payment, staff));

        parkingRecordRepository.delete(parkingRecord);

        return recordMapper.toParkingExitResponse(recordHistory);
    }

    @Override
    public List<ParkingEntryResponse> getAllRecordInParking() {
        return parkingRecordRepository.findAll().stream()
                .map(recordMapper::toParkingEntryResponse).toList();
    }

    public int calculateParkingFee(ParkingRecord record) {
        Price price = priceRepository.findById(record.getVehicleType().getId())
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_PRICE_NOT_FOUND));
        LocalDateTime entryTime = record.getEntryTime();
        LocalDateTime exitTime = LocalDateTime.now();
        Duration duration = Duration.between(entryTime, exitTime);
        long days = duration.toDays();
        boolean isOver24h = duration.toDays() >= 1;

        int fee;
        if (record.getType() == ParkingType.MONTHLY) {
            fee = 0;
        } else {
            long fullDays = duration.toDays();
            fee = (int) (fullDays * (price.getDayPrice() + price.getNightPrice()));
            
            Duration remainingDuration = duration.minusDays(fullDays);
            
            if (remainingDuration.toMinutes() > 0 || fullDays == 0) {
                LocalDateTime remainingEntry = entryTime.plusDays(fullDays);
                int remainFee = 0;
                
                boolean isDayTimeEntry = remainingEntry.getHour() >= configService.getShiftConfig().getDayShiftStartHour() 
                        && remainingEntry.getHour() < configService.getShiftConfig().getNightShiftStartHour();
                boolean isDayTimeExit = exitTime.getHour() >= configService.getShiftConfig().getDayShiftStartHour() 
                        && exitTime.getHour() < configService.getShiftConfig().getNightShiftStartHour();
                boolean isSameDay = remainingEntry.toLocalDate().equals(exitTime.toLocalDate());
                
                if (isSameDay) {
                    if (isDayTimeEntry && isDayTimeExit) {
                        remainFee = price.getDayPrice();
                    } else if (!isDayTimeEntry && !isDayTimeExit) {
                        remainFee = price.getNightPrice();
                    } else {
                        remainFee = price.getDayPrice() + price.getNightPrice();
                    }
                } else {
                    int dayLength = configService.getShiftConfig().getNightShiftStartHour() - configService.getShiftConfig().getDayShiftStartHour();
                    if (dayLength < 0) dayLength += 24;
                    
                    if (!isDayTimeEntry && !isDayTimeExit && remainingDuration.toHours() < (24 - dayLength)) {
                        remainFee = price.getNightPrice();
                    } else {
                        remainFee = price.getDayPrice() + price.getNightPrice();
                    }
                }
                
                fee += remainFee;
            }
        }

        return fee;
    }

    public ParkingRecordHistory recordToHistory(ParkingRecord record, Payment payment, Account staff) {
        return ParkingRecordHistory.builder()
                .licensePlate(record.getLicensePlate())
                .identifier(record.getIdentifier())
                .vehicleType(record.getVehicleType())
                .card(record.getCard())
                .entryTime(record.getEntryTime())
                .exitTime(LocalDateTime.now())
                .type(record.getType())
                .payment(payment)
                .staffIn(record.getStaffIn())
                .staffOut(staff)
                .build();
    }

    @Override
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public List<VehicleTypeResponse> getAllVehicleType() {
        return vehicleTypeRepository.findAll().stream().map(vehicleTypeMapper::toVehicleTypeResponse).toList();
    }

    @Override
    public List<TodayTrafficResponse> getTodayTraffic() {
        LocalDate today = LocalDate.now();
        List<TodayTrafficResponse> result = new ArrayList<>();

        // get start time and end time of day
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        // get entry records of day
        List<ParkingRecord> currentRecords = parkingRecordRepository.findByEntryTimeBetween(startOfDay, endOfDay);
        // entry record from in parking record
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

        // get exits records of day
        List<ParkingRecordHistory> historyRecords = parkingRecordHistoryRepository.findByExitTimeBetween(
                startOfDay, endOfDay);

        for (ParkingRecordHistory record : historyRecords) {
            // entry record from history
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
            // exit record from history
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
        result.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return result;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<ParkingExitResponse> getParkingHistoryByDate(int month, int day) {
        int currentYear = LocalDate.now().getYear();

        LocalDate targetDate = LocalDate.of(currentYear, month, day);

        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay = targetDate.atTime(23, 59, 59);

        List<ParkingRecordHistory> historyRecord = parkingRecordHistoryRepository.findByExitTimeBetween(startOfDay,
                endOfDay);
        return historyRecord.stream().map(recordMapper::toParkingExitResponse).toList();
    }

}
