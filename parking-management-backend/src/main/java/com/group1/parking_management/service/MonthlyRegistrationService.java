package com.group1.parking_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.MonthlyRegistrationRequest;
import com.group1.parking_management.dto.response.MonthlyRegistrationResponse;

@Service
public interface MonthlyRegistrationService {
    public MonthlyRegistrationResponse createMonthlyRegistration(MonthlyRegistrationRequest request);

    public List<MonthlyRegistrationResponse> getAllActiveRegistration();

    public List<MonthlyRegistrationResponse> getAllExpireRegistration();
}
