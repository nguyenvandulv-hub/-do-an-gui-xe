package com.group1.parking_management.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.group1.parking_management.entity.ParkingRecordHistory;

@Repository
public interface ParkingRecordHistoryRepository extends JpaRepository<ParkingRecordHistory, String> {
    @Query("SELECT COUNT(p) FROM ParkingRecordHistory p WHERE p.entryTime BETWEEN :startDate AND :endDate")
    long sumVehicleBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<ParkingRecordHistory> findByExitTimeBetween(LocalDateTime start, LocalDateTime end);
}
