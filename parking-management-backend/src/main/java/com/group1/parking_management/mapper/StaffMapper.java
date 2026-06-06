package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.request.StaffUpdateRequest;
import com.group1.parking_management.dto.response.StaffResponse;
import com.group1.parking_management.entity.Staff;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface StaffMapper {

    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "account", ignore = true)
    void updateFromStaffRequest(@MappingTarget Staff staff, StaffUpdateRequest request);

    @Mapping(target = "username", source = "account.username")
    StaffResponse toStaffResponse(Staff staff);
}
