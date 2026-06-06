package com.group1.parking_management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "price")
public class Price {
    
    @Id
    @Column(name = "type_id")
    private String vehicleTypeId;
    
    @MapsId
    @OneToOne
    @JoinColumn(name = "type_id")
    private VehicleType type;
    
    @Column(nullable = false)
    private Integer dayPrice;
    
    @Column(nullable = false)
    private Integer nightPrice;
    
    @Column(nullable = false)
    private Integer monthlyPrice;
}