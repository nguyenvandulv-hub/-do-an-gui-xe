package com.group1.parking_management.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.group1.parking_management.dto.request.ShiftConfigRequest;
import com.group1.parking_management.dto.response.ShiftConfigResponse;
import com.group1.parking_management.entity.SystemConfig;
import com.group1.parking_management.repository.SystemConfigRepository;
import com.group1.parking_management.service.ConfigService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConfigServiceImpl implements ConfigService {
    
    private final SystemConfigRepository systemConfigRepository;
    
    private static final String DAY_SHIFT_KEY = "DAY_SHIFT_START_HOUR";
    private static final String NIGHT_SHIFT_KEY = "NIGHT_SHIFT_START_HOUR";
    
    // Default values if not in database
    private static final int DEFAULT_DAY_SHIFT_START = 5;
    private static final int DEFAULT_NIGHT_SHIFT_START = 18;

    @Override
    public ShiftConfigResponse getShiftConfig() {
        int dayStart = getIntConfig(DAY_SHIFT_KEY, DEFAULT_DAY_SHIFT_START);
        int nightStart = getIntConfig(NIGHT_SHIFT_KEY, DEFAULT_NIGHT_SHIFT_START);
        
        return ShiftConfigResponse.builder()
                .dayShiftStartHour(dayStart)
                .nightShiftStartHour(nightStart)
                .build();
    }

    @Override
    @Transactional
    public ShiftConfigResponse updateShiftConfig(ShiftConfigRequest request) {
        saveConfig(DAY_SHIFT_KEY, String.valueOf(request.getDayShiftStartHour()), "Giờ bắt đầu ca ngày (0-23)");
        saveConfig(NIGHT_SHIFT_KEY, String.valueOf(request.getNightShiftStartHour()), "Giờ bắt đầu ca đêm (0-23)");
        
        return getShiftConfig();
    }
    
    private int getIntConfig(String key, int defaultValue) {
        return systemConfigRepository.findById(key)
                .map(config -> {
                    try {
                        return Integer.parseInt(config.getValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }
    
    private void saveConfig(String key, String value, String description) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElse(SystemConfig.builder().key(key).build());
        
        config.setValue(value);
        config.setDescription(description);
        
        systemConfigRepository.save(config);
    }
}
