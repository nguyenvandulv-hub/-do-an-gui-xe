package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.response.MonthlyRegistrationResponse;
import com.group1.parking_management.entity.ActiveMonthlyRegistration;
import com.group1.parking_management.entity.ExpireMonthlyRegistration;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MonthlyRegistrationMapper {
    MonthlyRegistrationResponse activeToResponse(ActiveMonthlyRegistration registration);
    MonthlyRegistrationResponse expireToResponse(ExpireMonthlyRegistration registration);
}
