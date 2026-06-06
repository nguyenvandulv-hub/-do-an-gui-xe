package com.group1.parking_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.group1.parking_management.entity.Staff;

public interface StaffRepository extends JpaRepository<Staff, String> {
    
    @Query("""
        SELECT s FROM Staff s 
        JOIN FETCH s.account a 
        WHERE s.accountId = :accountId
    """)
    Optional<Staff> findByIdWithAccount(@Param("accountId") String accountId);

    @Query("""
        SELECT s FROM Staff s 
        JOIN FETCH s.account a
    """)
    List<Staff> findAllWithAccount();
    
    boolean existsByIdentification(String identification);
}

