package com.group1.parking_management.entity;

import java.time.LocalDate;

import com.group1.parking_management.common.Gender;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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
@Table(name = "staff")
public class Staff {
    @Id
    private String accountId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "account_id")
    private Account account;
    
    @Column(unique = true, nullable = false, length = 20)
    private String identification;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    private LocalDate dob;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(nullable = false, length = 15)
    private String phoneNumber;
    
    @Column(nullable = false, length = 200)
    private String address;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false)
    private Boolean isActive;
}
