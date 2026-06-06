package com.group1.parking_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.request.StaffCreationRequest;
import com.group1.parking_management.dto.request.StaffUpdateRequest;
import com.group1.parking_management.dto.response.StaffResponse;
import com.group1.parking_management.service.StaffService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/staffs")
@RequiredArgsConstructor
public class StaffController {
    private final StaffService staffService;

    @PostMapping
    public ApiResponse<StaffResponse> createStaff(@RequestBody @Valid StaffCreationRequest request) {
        return ApiResponse.<StaffResponse>builder()
                .result(staffService.createStaff(request))
                .build();
    }

    @GetMapping("/{accountId}")
    public ApiResponse<StaffResponse> getStaffById(@PathVariable String accountId) {
        return ApiResponse.<StaffResponse>builder()
                .result(staffService.getStaffById(accountId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<StaffResponse>> getAllStaff() {
        return ApiResponse.<List<StaffResponse>>builder()
                .result(staffService.getAllStaff())
                .build();
    }

    @PutMapping("/{accountId}")
    public ApiResponse<StaffResponse> updateStaff(@PathVariable String accountId,
            @RequestBody @Valid StaffUpdateRequest request) {
        return ApiResponse.<StaffResponse>builder()
                .result(staffService.updateStaff(accountId, request))
                .build();
    }
}
