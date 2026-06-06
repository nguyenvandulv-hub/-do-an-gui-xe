package com.group1.parking_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.group1.parking_management.entity.ExpireMonthlyRegistration;

@Repository
public interface ExpireMonthlyRegistrationRepository extends JpaRepository<ExpireMonthlyRegistration, String> {
    List<ExpireMonthlyRegistration> findAllByOrderByIssueDateDesc();
}
