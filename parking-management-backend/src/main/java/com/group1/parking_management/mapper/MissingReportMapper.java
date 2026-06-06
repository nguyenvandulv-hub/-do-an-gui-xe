package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.response.MissingReportResponse;
import com.group1.parking_management.entity.MissingReport;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MissingReportMapper {
    MissingReportResponse toReportResponse(MissingReport report);
}
