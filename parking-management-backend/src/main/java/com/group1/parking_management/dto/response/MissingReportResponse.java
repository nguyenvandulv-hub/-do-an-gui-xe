package com.group1.parking_management.dto.response;

import java.time.LocalDateTime;

import com.group1.parking_management.common.Gender;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.ParkingRecordHistory;
import com.group1.parking_management.entity.Payment;
import com.group1.parking_management.entity.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingReportResponse {
    private String reportId;
    private ParkingRecordHistory record;
    private String licensePlate;
    private String identifier;
    private VehicleType vehicleType;
    private String name;
    private Gender gender;
    private String phoneNumber;
    private String address;
    private String brand;
    private String color;
    private String identification;
    private Payment payment;
    private Account createBy;
    private LocalDateTime createAt;
}
