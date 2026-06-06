package com.group1.parking_management.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.ChangePriceRequest;
import com.group1.parking_management.dto.response.PriceResponse;

@Service
public interface PriceService {
    public List<PriceResponse> getAllPrice();

    public PriceResponse updatePrice(String priceId, ChangePriceRequest request);
}
