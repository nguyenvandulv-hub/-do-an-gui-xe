package com.group1.parking_management.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangePriceRequest {
    private Integer dayPrice;
    private Integer nightPrice;
    private Integer monthlyPrice;
}
