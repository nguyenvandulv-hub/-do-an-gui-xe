package com.group1.parking_management.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.group1.parking_management.entity.Account;
import com.group1.parking_management.entity.Customer;
import com.group1.parking_management.entity.Payment;
import com.group1.parking_management.entity.Vehicle;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MonthlyRegistrationResponse {
    private String id;
    private LocalDateTime issueDate;
    private LocalDateTime expirationDate;
    private Customer customer;
    private Vehicle vehicle;
    private Account createBy;
    private Payment payment;
}
