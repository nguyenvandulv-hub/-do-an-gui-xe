package com.group1.parking_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.group1.parking_management.entity.MissingReport;

@Repository
public interface MissingReportRepository extends JpaRepository<MissingReport, String> {
    List<MissingReport> findAllByOrderByCreateAtDesc();
    boolean existsByLicensePlate(String licensePlate);
}
