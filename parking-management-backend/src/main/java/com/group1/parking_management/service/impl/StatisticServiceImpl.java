package com.group1.parking_management.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.response.RevenueStatisticsResponse;
import com.group1.parking_management.dto.response.TrafficStatisticResponse;
import com.group1.parking_management.dto.response.WeeklyRevenueResponse;
import com.group1.parking_management.dto.response.WeeklyVehicleResponse;
import com.group1.parking_management.repository.ParkingRecordHistoryRepository;
import com.group1.parking_management.repository.PaymentRepository;
import com.group1.parking_management.service.StatisticService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatisticServiceImpl implements StatisticService {
    private final PaymentRepository paymentRepository;
    private final ParkingRecordHistoryRepository parkingRecordHistoryRepository;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public RevenueStatisticsResponse getMonthlyRevenue(int month, int year) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        List<WeeklyRevenueResponse> weeklyRevenue = new ArrayList<>();
        LocalDate startDate = firstDay;
        int week = 1;
        long totalRevenue = 0;

        while (startDate.isBefore(lastDay) || startDate.isEqual(lastDay)) {
            LocalDate endDate = startDate.plusDays(6);
            if (endDate.isAfter(lastDay)) {
                endDate = lastDay;
            }

            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

            long revenue = paymentRepository.sumRevenueBetween(startDateTime, endDateTime);
            totalRevenue += revenue;

            weeklyRevenue.add(WeeklyRevenueResponse.builder()
                    .week(week++)
                    .startDate(startDate)
                    .endDate(endDate)
                    .totalRevenue(revenue)
                    .build());
            startDate = endDate.plusDays(1);
        }

        return RevenueStatisticsResponse.builder()
                .month(month)
                .year(year)
                .weeklyRevenue(weeklyRevenue)
                .totalWeeks(week - 1)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public TrafficStatisticResponse getMonthlyTraffic(int month, int year) {
        LocalDate firstDay = LocalDate.of(year, month, 1);
        LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());

        List<WeeklyVehicleResponse> weeklyVehicle = new ArrayList<>();
        LocalDate startDate = firstDay;
        int week = 1;
        long totalVehicle = 0;

        while (startDate.isBefore(lastDay) || startDate.isEqual(lastDay)) {
            LocalDate endDate = startDate.plusDays(6);
            if (endDate.isAfter(lastDay)) {
                endDate = lastDay;
            }

            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

            long recordCount = parkingRecordHistoryRepository.sumVehicleBetween(startDateTime, endDateTime);
            totalVehicle += recordCount;

            weeklyVehicle.add(WeeklyVehicleResponse.builder()
                    .week(week++)
                    .startDate(startDate)
                    .endDate(endDate)
                    .totalVehicle(recordCount)
                    .build());
            startDate = endDate.plusDays(1);
        }

        return TrafficStatisticResponse.builder()
                .month(month)
                .year(year)
                .weeklyVehicle(weeklyVehicle)
                .totalWeeks(week - 1)
                .totalVehicle(totalVehicle)
                .build();
    }

}
