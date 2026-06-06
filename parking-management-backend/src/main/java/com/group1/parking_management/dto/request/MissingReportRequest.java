package com.group1.parking_management.dto.request;

import com.group1.parking_management.common.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissingReportRequest {
    private String licensePlate;
    private String identifier;
    private String vehicleTypeId;
    private String name;
    private Gender gender;
    private String phoneNumber;
    private String address;
    private String brand;
    private String color;
    private String identification;
}
