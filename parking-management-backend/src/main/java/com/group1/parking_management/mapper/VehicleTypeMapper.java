package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.response.VehicleTypeResponse;
import com.group1.parking_management.entity.VehicleType;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleTypeMapper {
    VehicleTypeResponse toVehicleTypeResponse(VehicleType vehicleType);
}
