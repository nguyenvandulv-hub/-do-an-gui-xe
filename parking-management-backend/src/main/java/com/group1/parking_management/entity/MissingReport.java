package com.group1.parking_management.entity;

import java.time.LocalDateTime;

import com.group1.parking_management.common.Gender;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "missing_report")
public class MissingReport {
    @Id
    @Column(length = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String reportId;
    
    @OneToOne
    @JoinColumn(name = "record_id", unique = true)
    private ParkingRecordHistory record;
    
    @Column(length = 20)
    private String licensePlate;

    @Column(length = 20)
    private String identifier;
    
    @ManyToOne
    @JoinColumn(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(nullable = false, length = 15)
    private String phoneNumber;
    
    @Column(nullable = false, length = 200)
    private String address;
    
    @Column(nullable = false, length = 50)
    private String brand;
    
    @Column(nullable = false, length = 30)
    private String color;
    
    @Column(nullable = false, length = 30)
    private String identification;
    
    @OneToOne
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    
    @ManyToOne
    @JoinColumn(name = "create_by", nullable = false)
    private Account createBy;
    
    @Column(nullable = false)
    private LocalDateTime createAt;
}