package com.group1.parking_management.service;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.ChangePasswordRequest;
import com.group1.parking_management.dto.request.LoginRequest;
import com.group1.parking_management.dto.request.LogoutRequest;
import com.group1.parking_management.dto.request.RegisterStaffRequest;
import com.group1.parking_management.dto.request.GoogleLoginRequest;
import com.group1.parking_management.dto.response.LoginResponse;
import com.group1.parking_management.dto.response.StaffResponse;

@Service
public interface AuthenticationService {
    public LoginResponse login(LoginRequest request);
    public void logout(LogoutRequest request);
    public StaffResponse getMyInfo();
    public void changePassword(ChangePasswordRequest request);
    public void sendOtp(String email);
    public StaffResponse registerStaff(RegisterStaffRequest request);
    public LoginResponse googleLogin(GoogleLoginRequest request);
}
