package com.group1.parking_management.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.group1.parking_management.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findAllByOrderByCreateAtDesc();
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.createAt BETWEEN :startDate AND :endDate")
    long sumRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    List<Payment> findByCreateAtBetweenOrderByCreateAtDesc(LocalDateTime startDate, LocalDateTime endDate);
}
