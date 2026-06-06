package com.group1.parking_management.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingEntryRequest {

    @Size(max = 20)
    private String licensePlate;

    @Size(max = 50)
    private String identifier;

    @NotNull
    private String vehicleTypeId;

}
