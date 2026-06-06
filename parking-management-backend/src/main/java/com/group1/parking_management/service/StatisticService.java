package com.group1.parking_management.service;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.response.RevenueStatisticsResponse;
import com.group1.parking_management.dto.response.TrafficStatisticResponse;

@Service
public interface StatisticService {
    public RevenueStatisticsResponse getMonthlyRevenue(int month, int year);

    public TrafficStatisticResponse getMonthlyTraffic(int month, int year);
}
