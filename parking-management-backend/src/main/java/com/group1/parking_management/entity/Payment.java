package com.group1.parking_management.entity;

import java.time.LocalDateTime;

import com.group1.parking_management.common.PaymentType;

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
@Table(name = "payment")
public class Payment {
    @Id
    @Column(length = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String paymentId;
    
    @Column(nullable = false)
    private Integer amount;
    
    @Column(nullable = false)
    private LocalDateTime createAt;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;
}