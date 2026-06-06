package com.group1.parking_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.request.MonthlyRegistrationRequest;
import com.group1.parking_management.dto.response.MonthlyRegistrationResponse;
import com.group1.parking_management.service.MonthlyRegistrationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/monthly-cards")
@RequiredArgsConstructor
public class MonthlyRegistrationController {

    private final MonthlyRegistrationService monthlyRegistrationService;

    @PostMapping
    public ApiResponse<MonthlyRegistrationResponse> createRegistration(
            @RequestBody @Valid MonthlyRegistrationRequest request) {
        return ApiResponse.<MonthlyRegistrationResponse>builder()
                .result(monthlyRegistrationService.createMonthlyRegistration(request))
                .build();
    }

    @GetMapping("/active")
    public ApiResponse<List<MonthlyRegistrationResponse>> getAllActiveRegistration() {
        return ApiResponse.<List<MonthlyRegistrationResponse>>builder()
                .result(monthlyRegistrationService.getAllActiveRegistration())
                .build();
    }

    @GetMapping("/expire")
    public ApiResponse<List<MonthlyRegistrationResponse>> getAllExpireRegistration() {
        return ApiResponse.<List<MonthlyRegistrationResponse>>builder()
                .result(monthlyRegistrationService.getAllExpireRegistration())
                .build();
    }
}