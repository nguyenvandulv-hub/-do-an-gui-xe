package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.request.ChangePriceRequest;
import com.group1.parking_management.dto.response.PriceResponse;
import com.group1.parking_management.entity.Price;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PriceMapper {
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "vehicleTypeId", ignore = true)
    void updateRequestToPrice(ChangePriceRequest request, @MappingTarget Price price);
    PriceResponse toPriceResponse(Price price);
}
