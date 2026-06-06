package com.group1.parking_management.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.request.ShiftConfigRequest;
import com.group1.parking_management.dto.response.ShiftConfigResponse;
import com.group1.parking_management.service.ConfigService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/config")
@RequiredArgsConstructor
public class ConfigController {
    
    private final ConfigService configService;

    @GetMapping("/shifts")
    public ApiResponse<ShiftConfigResponse> getShiftConfig() {
        return ApiResponse.<ShiftConfigResponse>builder()
                .result(configService.getShiftConfig())
                .build();
    }

    @PutMapping("/shifts")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ShiftConfigResponse> updateShiftConfig(@RequestBody ShiftConfigRequest request) {
        return ApiResponse.<ShiftConfigResponse>builder()
                .result(configService.updateShiftConfig(request))
                .build();
    }
}
