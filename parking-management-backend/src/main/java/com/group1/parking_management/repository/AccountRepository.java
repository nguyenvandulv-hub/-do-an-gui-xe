package com.group1.parking_management.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.group1.parking_management.entity.Account;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUsername(String username);
    boolean existsByUsername(String username);
}
