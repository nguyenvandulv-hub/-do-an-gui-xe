package com.group1.parking_management.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TrafficStatisticResponse {
    private int month;
    private int year;
    private List<WeeklyVehicleResponse> weeklyVehicle;
    private int totalWeeks;
    private long totalVehicle;
}
