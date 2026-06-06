package com.group1.parking_management.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.group1.parking_management.dto.response.ParkingEntryResponse;
import com.group1.parking_management.dto.response.ParkingExitResponse;
import com.group1.parking_management.entity.ParkingRecord;
import com.group1.parking_management.entity.ParkingRecordHistory;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RecordMapper {

    @Mapping(target = "cardId", source = "card.cardId")
    ParkingEntryResponse toParkingEntryResponse(ParkingRecord parkingRecord);

    ParkingExitResponse toParkingExitResponse(ParkingRecordHistory parkingRecordHistory);
}
