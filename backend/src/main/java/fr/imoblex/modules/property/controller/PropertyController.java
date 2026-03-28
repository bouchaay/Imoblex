package fr.imoblex.modules.property.controller;

import fr.imoblex.modules.property.dto.PropertyCreateRequest;
import fr.imoblex.modules.property.dto.PropertyResponse;
import fr.imoblex.modules.property.dto.PropertySearchRequest;
import fr.imoblex.modules.property.service.PropertyService;
import fr.imoblex.shared.response.ApiResponse;
import fr.imoblex.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@Tag(name = "Biens immobiliers", description = "Gestion des biens immobiliers")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    @Operation(summary = "Recherche et liste des biens (back-office)")
    public ResponseEntity<PageResponse<PropertyResponse>> search(PropertySearchRequest request) {
        Page<PropertyResponse> page = propertyService.search(request);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un bien par ID")
    public ResponseEntity<ApiResponse<PropertyResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.findById(id)));
    }

    @GetMapping("/ref/{reference}")
    @Operation(summary = "Détail d'un bien par référence")
    public ResponseEntity<ApiResponse<PropertyResponse>> getByReference(@PathVariable String reference) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.findByReference(reference)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @Operation(summary = "Créer un bien")
    public ResponseEntity<ApiResponse<PropertyResponse>> create(@Valid @RequestBody PropertyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(propertyService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @Operation(summary = "Modifier un bien")
    public ResponseEntity<ApiResponse<PropertyResponse>> update(
        @PathVariable UUID id,
        @Valid @RequestBody PropertyCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Supprimer un bien")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        propertyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'AGENT')")
    @Operation(summary = "Publier/dépublier un bien sur le site")
    public ResponseEntity<ApiResponse<PropertyResponse>> togglePublish(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(propertyService.togglePublish(id)));
    }
}
