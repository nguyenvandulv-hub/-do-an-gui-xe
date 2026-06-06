package com.group1.parking_management.service;

import com.group1.parking_management.dto.request.ShiftConfigRequest;
import com.group1.parking_management.dto.response.ShiftConfigResponse;

public interface ConfigService {
    ShiftConfigResponse getShiftConfig();
    ShiftConfigResponse updateShiftConfig(ShiftConfigRequest request);
}
