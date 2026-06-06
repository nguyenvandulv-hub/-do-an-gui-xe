package com.group1.parking_management.entity;

import java.time.LocalDate;

import com.group1.parking_management.common.CustomerType;
import com.group1.parking_management.common.Gender;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customer")
public class Customer {
    @Id
    @Column(length = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String customerId;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CustomerType customerType;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(nullable = false)
    private LocalDate dob;
    
    @Column(nullable = false, length = 15)
    private String phoneNumber;
    
    @Column(nullable = false, length = 200)
    private String address;
    
    @Column(nullable = false, length = 100)
    private String email;
}