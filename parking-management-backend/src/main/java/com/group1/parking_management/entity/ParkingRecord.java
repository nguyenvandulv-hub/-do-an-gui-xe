package com.group1.parking_management.entity;

import java.time.LocalDateTime;

import com.group1.parking_management.common.ParkingType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "parking_record")
public class ParkingRecord {
    @Id
    @Column(length = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String recordId;

    @Column(length = 20)
    private String licensePlate;
    
    @Column(length = 50)
    private String identifier;

    @ManyToOne
    @JoinColumn(name = "vehicle_type", nullable = false)
    private VehicleType vehicleType;
    
    @ManyToOne
    @JoinColumn(name = "card_id", nullable = false)
    private ParkingCard card;

    @Column(nullable = false)
    private LocalDateTime entryTime;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ParkingType type;

    @ManyToOne
    @JoinColumn(name = "staff_in", nullable = false)
    private Account staffIn;
}