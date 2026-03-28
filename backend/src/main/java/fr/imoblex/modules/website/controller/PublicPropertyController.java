package fr.imoblex.modules.website.controller;

import fr.imoblex.modules.property.dto.PropertyResponse;
import fr.imoblex.modules.property.dto.PropertySearchRequest;
import fr.imoblex.modules.property.service.PropertyService;
import fr.imoblex.shared.response.ApiResponse;
import fr.imoblex.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/public/properties")
@RequiredArgsConstructor
@Tag(name = "Site public - Annonces", description = "Endpoints publics pour le site imoblex.fr")
public class PublicPropertyController {

    private final PropertyService propertyService;

    @GetMapping
    @Operation(summary = "Recherche publique des annonces")
    public ResponseEntity<PageResponse<PropertyResponse>> search(PropertySearchRequest request) {
        request.setPublicSearch(true);
        Page<PropertyResponse> page = propertyService.search(request);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une annonce publique")
    public ResponseEntity<ApiResponse<PropertyResponse>> getById(@PathVariable UUID id) {
        propertyService.incrementViewCount(id);
        return ResponseEntity.ok(ApiResponse.success(propertyService.findById(id)));
    }

    @GetMapping("/ref/{reference}")
    @Operation(summary = "Détail par référence")
    public ResponseEntity<ApiResponse<PropertyResponse>> getByReference(@PathVariable String reference) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.findByReference(reference)));
    }
}
