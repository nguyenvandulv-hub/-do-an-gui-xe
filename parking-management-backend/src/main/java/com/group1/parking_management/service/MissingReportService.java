package com.group1.parking_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.MissingReportRequest;
import com.group1.parking_management.dto.response.MissingReportResponse;

@Service
public interface MissingReportService {
    public MissingReportResponse createMissingReport(MissingReportRequest request);
    List<MissingReportResponse> getAllMissingReport();
}
