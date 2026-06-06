package com.group1.parking_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group1.parking_management.dto.ApiResponse;
import com.group1.parking_management.dto.response.PaymentResponse;
import com.group1.parking_management.service.PaymentService;
import com.group1.parking_management.service.ExcelExportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final ExcelExportService excelExportService;

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayment() {
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(paymentService.getAllPayment())
                .build();
    }

    @GetMapping("/at-date")
    public ApiResponse<List<PaymentResponse>> getPaymentByDate(@org.springframework.web.bind.annotation.RequestParam int month,
            @org.springframework.web.bind.annotation.RequestParam int day) {
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(paymentService.getPaymentByDate(month, day))
                .build();
    }

    @GetMapping("/export")
    public org.springframework.http.ResponseEntity<byte[]> exportPayments() {
        try {
            List<PaymentResponse> payments = paymentService.getAllPayment();
            byte[] excelContent = excelExportService.exportPaymentsToExcel(payments);
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "payments.xlsx");
            
            return new org.springframework.http.ResponseEntity<>(excelContent, headers, org.springframework.http.HttpStatus.OK);
        } catch (java.io.IOException e) {
            return org.springframework.http.ResponseEntity.internalServerError().build();
        }
    }
}
