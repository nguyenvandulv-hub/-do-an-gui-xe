package com.group1.parking_management.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.ParkingCard;
import com.group1.parking_management.entity.Payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ParkingExitResponse {
    private String historyId;
    private String licensePlate;
    private String identifier;
    private ParkingCard card;
    private LocalDateTime exitTime;
    private Payment payment;
    private Account staffOut;
    private com.group1.parking_management.entity.VehicleType vehicleType;
    private LocalDateTime entryTime;
    private com.group1.parking_management.common.ParkingType type;
    private Account staffIn;
}
