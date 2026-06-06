package com.group1.parking_management.service.impl;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.group1.parking_management.common.Role;
import com.group1.parking_management.dto.request.StaffCreationRequest;
import com.group1.parking_management.dto.request.StaffUpdateRequest;
import com.group1.parking_management.dto.response.StaffResponse;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.Staff;
import com.group1.parking_management.exception.AppException;
import com.group1.parking_management.exception.ErrorCode;
import com.group1.parking_management.mapper.StaffMapper;
import com.group1.parking_management.repository.AccountRepository;
import com.group1.parking_management.repository.StaffRepository;
import com.group1.parking_management.service.StaffService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final StaffMapper staffMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public StaffResponse createStaff(StaffCreationRequest request) {
        if (staffRepository.existsByIdentification(request.getIdentification())) {
            throw new AppException(ErrorCode.STAFF_IDENTIFICATION_EXISTED);
        }

        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }

        Role staffRole = Role.STAFF;

        Account account = Account.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(staffRole)
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
                .isActive(true)
                .build();

        staffRepository.save(staff);

        return staffMapper.toStaffResponse(staff);
    }

    @Override
    public StaffResponse getStaffById(String accountId) {
        Staff staff = staffRepository.findByIdWithAccount(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
        return staffMapper.toStaffResponse(staff);
    }

    @Override
    public List<StaffResponse> getAllStaff() {
        List<Staff> staffList = staffRepository.findAllWithAccount();
        return staffList.stream().map(staffMapper::toStaffResponse).toList();
    }

    @Override
    public StaffResponse updateStaff(String staffId, StaffUpdateRequest request) {

        Staff staff = staffRepository.findByIdWithAccount(staffId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
        if (request.getIdentification() != null &&
                !staff.getIdentification().equals(request.getIdentification()) &&
                staffRepository.existsByIdentification(request.getIdentification())) {
            throw new AppException(ErrorCode.STAFF_IDENTIFICATION_EXISTED);
        }
        if (request.getUsername() != null) {
            Account account = staff.getAccount();

            // Check if username has changed
            if (!account.getUsername().equals(request.getUsername())) {
                if (accountRepository.existsByUsername(request.getUsername())) {
                    throw new AppException(ErrorCode.USERNAME_EXISTED);
                }
                account.setUsername(request.getUsername());
                accountRepository.save(account);
            }
        }

        // Other information using mapper
        staffMapper.updateFromStaffRequest(staff, request);

        return staffMapper.toStaffResponse(staffRepository.save(staff));
    }
}
