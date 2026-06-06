package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.response.PaymentResponse;
import com.group1.parking_management.entity.Payment;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PaymentMapper {
    PaymentResponse toResponse(Payment payment);
}
