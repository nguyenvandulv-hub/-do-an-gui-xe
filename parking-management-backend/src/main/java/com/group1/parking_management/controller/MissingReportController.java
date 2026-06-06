package com.group1.parking_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.request.MissingReportRequest;
import com.group1.parking_management.dto.response.MissingReportResponse;
import com.group1.parking_management.service.MissingReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/missing-reports")
@RequiredArgsConstructor
public class MissingReportController {
    private final MissingReportService missingReportService;

    @PostMapping
    public ApiResponse<MissingReportResponse> createMissingReport(@RequestBody @Valid MissingReportRequest request) {
        return ApiResponse.<MissingReportResponse>builder()
                .result(missingReportService.createMissingReport(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<MissingReportResponse>> getAllMissingReport() {
        return ApiResponse.<List<MissingReportResponse>>builder()
                .result(missingReportService.getAllMissingReport())
                .build(); 
    }
}
