package com.group1.parking_management.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.StaffCreationRequest;
import com.group1.parking_management.dto.request.StaffUpdateRequest;
import com.group1.parking_management.dto.response.StaffResponse;

@Service
public interface StaffService {
    StaffResponse createStaff(StaffCreationRequest request);

    StaffResponse getStaffById(String staffId);

    List<StaffResponse> getAllStaff();

    StaffResponse updateStaff(String staffId, StaffUpdateRequest request);
}
