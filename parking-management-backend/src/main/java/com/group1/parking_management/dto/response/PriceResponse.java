package com.group1.parking_management.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.group1.parking_management.entity.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PriceResponse {
    private VehicleType type;
    private Integer dayPrice;
    private Integer nightPrice;
    private Integer monthlyPrice;
}
