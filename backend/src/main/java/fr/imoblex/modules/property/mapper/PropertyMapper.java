package fr.imoblex.modules.property.mapper;

import fr.imoblex.modules.property.dto.PropertyCreateRequest;
import fr.imoblex.modules.property.dto.PropertyResponse;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.entity.PropertyPhoto;
import fr.imoblex.modules.property.entity.PropertyShop;
import fr.imoblex.modules.property.entity.PropertyTransport;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PropertyMapper {

    public PropertyResponse toResponse(Property p) {
        if (p == null) return null;

        return PropertyResponse.builder()
            .id(p.getId())
            .reference(p.getReference())
            .transactionType(p.getTransactionType())
            .propertyType(p.getPropertyType())
            .status(p.getStatus())
            .address(p.getAddress())
            .addressComplement(p.getAddressComplement())
            .city(p.getCity())
            .postalCode(p.getPostalCode())
            .department(p.getDepartment())
            .region(p.getRegion())
            .latitude(p.getLatitude())
            .longitude(p.getLongitude())
            .addressVisible(p.getAddressVisible())
            .price(p.getPrice())
            .pricePerSqm(p.getPricePerSqm())
            .rentCharges(p.getRentCharges())
            .rentDeposit(p.getRentDeposit())
            .priceNegotiable(p.getPriceNegotiable())
            .chargesIncluded(p.getChargesIncluded())
            .agencyFees(p.getAgencyFees())
            .agencyFeesInfo(p.getAgencyFeesInfo())
            .livingArea(p.getLivingArea())
            .totalArea(p.getTotalArea())
            .landArea(p.getLandArea())
            .rooms(p.getRooms())
            .bedrooms(p.getBedrooms())
            .bathrooms(p.getBathrooms())
            .toilets(p.getToilets())
            .floor(p.getFloor())
            .totalFloors(p.getTotalFloors())
            .parkingSpaces(p.getParkingSpaces())
            .description(p.getDescription())
            .shortDescription(p.getShortDescription())
            .elevator(p.getElevator())
            .balcony(p.getBalcony())
            .terrace(p.getTerrace())
            .garden(p.getGarden())
            .parking(p.getParking())
            .garage(p.getGarage())
            .cellar(p.getCellar())
            .pool(p.getPool())
            .fireplace(p.getFireplace())
            .airConditioning(p.getAirConditioning())
            .furnished(p.getFurnished())
            .accessible(p.getAccessible())
            .heatingType(p.getHeatingType())
            .heatingEnergy(p.getHeatingEnergy())
            .dpeClass(p.getDpeClass())
            .gesClass(p.getGesClass())
            .dpeValue(p.getDpeValue())
            .gesValue(p.getGesValue())
            .dpeDoneDate(p.getDpeDoneDate())
            .dpeExempt(p.getDpeExempt())
            .photos(mapPhotos(p.getPhotos()))
            .virtualTourUrl(p.getVirtualTourUrl())
            .videoUrl(p.getVideoUrl())
            .floorPlanUrl(p.getFloorPlanUrl())
            .publishedWebsite(p.getPublishedWebsite())
            .publishedSeloger(p.getPublishedSeloger())
            .publishedLeboncoin(p.getPublishedLeboncoin())
            .publishedPap(p.getPublishedPap())
            .publishedBienici(p.getPublishedBienici())
            .publishedAt(p.getPublishedAt())
            .agentId(p.getAgent() != null ? p.getAgent().getId() : null)
            .agentName(p.getAgent() != null ? p.getAgent().getFirstName() + " " + p.getAgent().getLastName() : null)
            .ownerId(p.getOwner() != null ? p.getOwner().getId() : null)
            .ownerName(p.getOwner() != null ? p.getOwner().getFirstName() + " " + p.getOwner().getLastName() : null)
            .availableFrom(p.getAvailableFrom())
            .constructionYear(p.getConstructionYear())
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .viewCount(p.getViewCount())
            .contactCount(p.getContactCount())
            .visitCount(p.getVisitCount())
            .transports(mapTransports(p.getTransports()))
            .shops(mapShops(p.getShops()))
            .build();
    }

    public Property toEntity(PropertyCreateRequest req) {
        return Property.builder()
            .transactionType(req.getTransactionType())
            .propertyType(req.getPropertyType())
            .status(req.getStatus() != null ? req.getStatus() : fr.imoblex.modules.property.enums.PropertyStatus.AVAILABLE)
            .address(req.getAddress())
            .addressComplement(req.getAddressComplement())
            .city(req.getCity())
            .postalCode(req.getPostalCode())
            .department(req.getDepartment())
            .region(req.getRegion())
            .latitude(req.getLatitude())
            .longitude(req.getLongitude())
            .addressVisible(req.getAddressVisible())
            .price(req.getPrice())
            .pricePerSqm(req.getPricePerSqm())
            .rentCharges(req.getRentCharges())
            .rentDeposit(req.getRentDeposit())
            .priceNegotiable(req.getPriceNegotiable())
            .chargesIncluded(req.getChargesIncluded())
            .agencyFees(req.getAgencyFees())
            .agencyFeesInfo(req.getAgencyFeesInfo())
            .livingArea(req.getLivingArea())
            .totalArea(req.getTotalArea())
            .landArea(req.getLandArea())
            .rooms(req.getRooms())
            .bedrooms(req.getBedrooms())
            .bathrooms(req.getBathrooms())
            .toilets(req.getToilets())
            .floor(req.getFloor())
            .totalFloors(req.getTotalFloors())
            .parkingSpaces(req.getParkingSpaces())
            .description(req.getDescription())
            .shortDescription(req.getShortDescription())
            .elevator(req.getElevator())
            .balcony(req.getBalcony())
            .terrace(req.getTerrace())
            .garden(req.getGarden())
            .parking(req.getParking())
            .garage(req.getGarage())
            .cellar(req.getCellar())
            .pool(req.getPool())
            .fireplace(req.getFireplace())
            .airConditioning(req.getAirConditioning())
            .furnished(req.getFurnished())
            .accessible(req.getAccessible())
            .heatingType(req.getHeatingType())
            .heatingEnergy(req.getHeatingEnergy())
            .dpeClass(req.getDpeClass())
            .gesClass(req.getGesClass())
            .dpeValue(req.getDpeValue())
            .gesValue(req.getGesValue())
            .dpeDoneDate(req.getDpeDoneDate())
            .dpeExempt(req.getDpeExempt())
            .virtualTourUrl(req.getVirtualTourUrl())
            .videoUrl(req.getVideoUrl())
            .floorPlanUrl(req.getFloorPlanUrl())
            .publishedWebsite(req.getPublishedWebsite())
            .publishedSeloger(req.getPublishedSeloger())
            .publishedLeboncoin(req.getPublishedLeboncoin())
            .publishedPap(req.getPublishedPap())
            .publishedBienici(req.getPublishedBienici())
            .availableFrom(req.getAvailableFrom())
            .constructionYear(req.getConstructionYear())
            .build();
    }

    public void updateFromRequest(PropertyCreateRequest req, Property p) {
        p.setTransactionType(req.getTransactionType());
        p.setPropertyType(req.getPropertyType());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        p.setAddress(req.getAddress());
        p.setAddressComplement(req.getAddressComplement());
        p.setCity(req.getCity());
        p.setPostalCode(req.getPostalCode());
        p.setDepartment(req.getDepartment());
        p.setRegion(req.getRegion());
        p.setLatitude(req.getLatitude());
        p.setLongitude(req.getLongitude());
        p.setAddressVisible(req.getAddressVisible());
        p.setPrice(req.getPrice());
        p.setPricePerSqm(req.getPricePerSqm());
        p.setRentCharges(req.getRentCharges());
        p.setRentDeposit(req.getRentDeposit());
        p.setPriceNegotiable(req.getPriceNegotiable());
        p.setChargesIncluded(req.getChargesIncluded());
        p.setAgencyFees(req.getAgencyFees());
        p.setAgencyFeesInfo(req.getAgencyFeesInfo());
        p.setLivingArea(req.getLivingArea());
        p.setTotalArea(req.getTotalArea());
        p.setLandArea(req.getLandArea());
        p.setRooms(req.getRooms());
        p.setBedrooms(req.getBedrooms());
        p.setBathrooms(req.getBathrooms());
        p.setToilets(req.getToilets());
        p.setFloor(req.getFloor());
        p.setTotalFloors(req.getTotalFloors());
        p.setParkingSpaces(req.getParkingSpaces());
        p.setDescription(req.getDescription());
        p.setShortDescription(req.getShortDescription());
        p.setElevator(req.getElevator());
        p.setBalcony(req.getBalcony());
        p.setTerrace(req.getTerrace());
        p.setGarden(req.getGarden());
        p.setParking(req.getParking());
        p.setGarage(req.getGarage());
        p.setCellar(req.getCellar());
        p.setPool(req.getPool());
        p.setFireplace(req.getFireplace());
        p.setAirConditioning(req.getAirConditioning());
        p.setFurnished(req.getFurnished());
        p.setAccessible(req.getAccessible());
        p.setHeatingType(req.getHeatingType());
        p.setHeatingEnergy(req.getHeatingEnergy());
        p.setDpeClass(req.getDpeClass());
        p.setGesClass(req.getGesClass());
        p.setDpeValue(req.getDpeValue());
        p.setGesValue(req.getGesValue());
        p.setDpeDoneDate(req.getDpeDoneDate());
        p.setDpeExempt(req.getDpeExempt());
        p.setVirtualTourUrl(req.getVirtualTourUrl());
        p.setVideoUrl(req.getVideoUrl());
        p.setFloorPlanUrl(req.getFloorPlanUrl());
        p.setPublishedWebsite(req.getPublishedWebsite());
        p.setPublishedSeloger(req.getPublishedSeloger());
        p.setPublishedLeboncoin(req.getPublishedLeboncoin());
        p.setPublishedPap(req.getPublishedPap());
        p.setPublishedBienici(req.getPublishedBienici());
        p.setAvailableFrom(req.getAvailableFrom());
        p.setConstructionYear(req.getConstructionYear());
    }

    private List<PropertyResponse.PhotoDto> mapPhotos(List<PropertyPhoto> photos) {
        if (photos == null) return Collections.emptyList();
        return photos.stream()
            .map(ph -> PropertyResponse.PhotoDto.builder()
                .id(ph.getId())
                .url(ph.getUrl())
                .thumbnailUrl(ph.getThumbnailUrl())
                .caption(ph.getCaption())
                .position(ph.getPosition())
                .build())
            .collect(Collectors.toList());
    }

    private List<PropertyResponse.TransportDto> mapTransports(List<PropertyTransport> transports) {
        if (transports == null) return Collections.emptyList();
        return transports.stream()
            .map(t -> PropertyResponse.TransportDto.builder()
                .id(t.getId() != null ? t.getId().toString() : null)
                .type(t.getType())
                .line(t.getLine())
                .name(t.getName())
                .distanceMeters(t.getDistanceMeters())
                .walkingMinutes(t.getWalkingMinutes())
                .displayOrder(t.getDisplayOrder())
                .build())
            .collect(Collectors.toList());
    }

    private List<PropertyResponse.ShopDto> mapShops(List<PropertyShop> shops) {
        if (shops == null) return Collections.emptyList();
        return shops.stream()
            .map(s -> PropertyResponse.ShopDto.builder()
                .id(s.getId() != null ? s.getId().toString() : null)
                .type(s.getType())
                .name(s.getName())
                .distanceMeters(s.getDistanceMeters())
                .walkingMinutes(s.getWalkingMinutes())
                .displayOrder(s.getDisplayOrder())
                .build())
            .collect(Collectors.toList());
    }
}
