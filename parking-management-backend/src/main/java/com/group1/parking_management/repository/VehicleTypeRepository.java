package com.group1.parking_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.group1.parking_management.entity.VehicleType;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, String> {
}
