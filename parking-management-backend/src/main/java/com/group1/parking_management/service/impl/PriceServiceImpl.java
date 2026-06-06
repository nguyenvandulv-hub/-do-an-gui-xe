package com.group1.parking_management.service.impl;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.group1.parking_management.dto.request.ChangePriceRequest;
import com.group1.parking_management.dto.response.PriceResponse;
import com.group1.parking_management.entity.Price;
import com.group1.parking_management.exception.AppException;
import com.group1.parking_management.exception.ErrorCode;
import com.group1.parking_management.mapper.PriceMapper;
import com.group1.parking_management.repository.PriceRepository;
import com.group1.parking_management.service.PriceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PriceServiceImpl implements PriceService {

    private final PriceRepository priceRepository;
    private final PriceMapper priceMapper;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<PriceResponse> getAllPrice() {
        return priceRepository.findAll().stream().map(priceMapper::toPriceResponse).toList();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public PriceResponse updatePrice(String vehicleTypeId, ChangePriceRequest request) {
        Price price = priceRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.PARKING_PRICE_NOT_FOUND));
        priceMapper.updateRequestToPrice(request, price);
        return priceMapper.toPriceResponse(priceRepository.save(price));
    }

}
