package com.group1.parking_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.response.PaymentResponse;

@Service
public interface PaymentService {
    public List<PaymentResponse> getAllPayment(); 
    public List<PaymentResponse> getPaymentByDate(int month, int day);
}
