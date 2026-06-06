package com.group1.parking_management.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.request.ChangePasswordRequest;
import com.group1.parking_management.dto.request.LoginRequest;
import com.group1.parking_management.dto.request.LogoutRequest;
import com.group1.parking_management.dto.response.LoginResponse;
import com.group1.parking_management.dto.response.StaffResponse;
import com.group1.parking_management.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.<LoginResponse>builder()
                .result(authenticationService.login(request))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(@RequestBody LogoutRequest request) {
        authenticationService.logout(request);
        return ApiResponse.<String>builder()
                .result("Logout successfully")
                .build();
    }

    @GetMapping("/my-info")
    public ApiResponse<StaffResponse> getMyInfo() {
        return ApiResponse.<StaffResponse>builder()
                .result(authenticationService.getMyInfo())
                .build();
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        authenticationService.changePassword(request);
        return ApiResponse.<String>builder()
                .result("Password changed successfully!")
                .build();
    }
}
