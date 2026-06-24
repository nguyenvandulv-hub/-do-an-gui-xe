package com.group1.parking_management.service.impl;

import java.text.ParseException;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.group1.parking_management.dto.request.ChangePasswordRequest;
import com.group1.parking_management.dto.request.LoginRequest;
import com.group1.parking_management.dto.request.LogoutRequest;
import com.group1.parking_management.dto.request.RegisterStaffRequest;
import com.group1.parking_management.dto.request.GoogleLoginRequest;
import com.group1.parking_management.dto.response.LoginResponse;
import com.group1.parking_management.dto.response.StaffResponse;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.Staff;
import com.group1.parking_management.common.Role;
import com.group1.parking_management.exception.AppException;
import com.group1.parking_management.exception.ErrorCode;
import com.group1.parking_management.repository.AccountRepository;
import com.group1.parking_management.repository.StaffRepository;
import com.group1.parking_management.service.AuthenticationService;
import com.group1.parking_management.service.RedisService;
import com.group1.parking_management.util.JwtUtil;
import com.nimbusds.jose.JOSEException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final JwtUtil jwtUtil;
    private final AccountRepository accountRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final RedisService redisService;
    private final com.group1.parking_management.mapper.StaffMapper staffMapper;

    public LoginResponse login(LoginRequest request) {
        Account account = accountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        // Kiểm tra xem là STAFF thì tài khoản phải active mới cho login
        if (Role.STAFF.equals(account.getRole())) {
            Staff staff = staffRepository.findById(account.getAccountId())
                    .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
            if (!Boolean.TRUE.equals(staff.getIsActive())) {
                throw new AppException(ErrorCode.AUTH_ACCOUNT_NOT_ACTIVE);
            }
        }

        String token = jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
        return LoginResponse.builder()
                .token(token)
                .username(account.getUsername())
                .role(account.getRole().toString())
                .build();
    }

    public void logout(LogoutRequest request) {
        String token = request.getToken();
        if (token == null || token.isEmpty()) {
            throw new AppException(ErrorCode.JWT_INVALID);
        }

        try {
            jwtUtil.validateToken(token);
            long expiration = jwtUtil.getExpirationTime(token) / 1000;
            long now = System.currentTimeMillis() / 1000;
            long ttl = expiration - now;

            if (ttl > 0) {
                redisService.addToBlacklist(token, ttl);
            }
        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.JWT_INVALID);
        }
    }

    @PreAuthorize("hasRole('STAFF')")
    public StaffResponse getMyInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
        Staff staff = staffRepository.findById(account.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
        return StaffResponse.builder()
                .username(username)
                .identification(staff.getIdentification())
                .name(staff.getName())
                .dob(staff.getDob())
                .gender(staff.getGender())
                .phoneNumber(staff.getPhoneNumber())
                .address(staff.getAddress())
                .email(staff.getEmail())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName(); 
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
        
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.AUTH_WRONG_PASSWORD);
        }

        if (passwordEncoder.matches(request.getNewPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.AUTH_PASSWORD_SAME_AS_OLD);
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    private final com.group1.parking_management.service.OtpService otpService;
    @org.springframework.beans.factory.annotation.Value("${google.client-id}")
    private String googleClientId;

    public void sendOtp(String email) {
        if (accountRepository.existsByUsername(email)) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        otpService.sendOtp(email);
    }

    @Transactional
    public StaffResponse registerStaff(RegisterStaffRequest request) {
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            throw new AppException(ErrorCode.AUTH_OTP_INVALID);
        }

        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }

        if (staffRepository.existsByIdentification(request.getIdentification())) {
            throw new AppException(ErrorCode.STAFF_IDENTIFICATION_EXISTED);
        }

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(com.group1.parking_management.common.Role.STAFF)
                .build();
        account = accountRepository.save(account);

        Staff staff = Staff.builder()
                .account(account)
                .identification(request.getIdentification())
                .name(request.getName())
                .dob(request.getDob())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .email(request.getEmail())
                .isActive(false) // Mặc định chưa được kích hoạt, đợi Admin duyệt
                .build();
        staff = staffRepository.save(staff);

        return staffMapper.toStaffResponse(staff);
    }

    @Transactional
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier =
                new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new AppException(ErrorCode.AUTH_GOOGLE_TOKEN_INVALID);
            }

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            java.util.Optional<Account> existingAccount = accountRepository.findByUsername(email);
            if (existingAccount.isPresent()) {
                Account account = existingAccount.get();
                Staff staff = staffRepository.findById(account.getAccountId())
                        .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
                if (!Boolean.TRUE.equals(staff.getIsActive())) {
                    throw new AppException(ErrorCode.AUTH_ACCOUNT_NOT_ACTIVE);
                }
                String token = jwtUtil.generateToken(account.getUsername(), account.getRole().toString());
                return LoginResponse.builder()
                        .token(token)
                        .username(account.getUsername())
                        .role(account.getRole().toString())
                        .build();
            } else {
                // Tạo mới tài khoản cho nhân viên qua Google ở trạng thái isActive = false
                Account account = Account.builder()
                        .username(email)
                        .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString())) // Mật khẩu ngẫu nhiên bảo mật
                        .role(com.group1.parking_management.common.Role.STAFF)
                        .build();
                account = accountRepository.save(account);

                Staff staff = Staff.builder()
                        .account(account)
                        .identification("GG_" + java.util.UUID.randomUUID().toString().substring(0, 8))
                        .name(name != null ? name : "Google User")
                        .dob(java.time.LocalDate.now())
                        .gender(com.group1.parking_management.common.Gender.MALE)
                        .phoneNumber("0000000000")
                        .address("Google Signed User")
                        .email(email)
                        .isActive(false) // Mặc định chưa được kích hoạt, đợi Admin duyệt
                        .build();
                staffRepository.save(staff);

                throw new AppException(ErrorCode.AUTH_GOOGLE_REGISTRATION_SUCCESS);
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.AUTH_GOOGLE_TOKEN_INVALID);
        }
    }
}
