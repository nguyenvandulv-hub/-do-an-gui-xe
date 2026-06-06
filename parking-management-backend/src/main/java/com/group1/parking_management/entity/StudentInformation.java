package com.group1.parking_management.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "student_information")
public class StudentInformation {
    @Id
    @Column(length = 36)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String customerId;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "customer_id")
    private Customer customer;
    
    @Column(nullable = false, length = 20)
    private String studentId;
    
    @Column(nullable = false, length = 100)
    private String faculty;
    
    @Column(nullable = false, length = 100)
    private String major;
    
    @Column(nullable = false, length = 50)
    private String classInfo;
}