package fr.imoblex.modules.mandate.controller;

import fr.imoblex.modules.mandate.dto.MandateRequest;
import fr.imoblex.modules.mandate.dto.MandateResponse;
import fr.imoblex.modules.mandate.service.MandateService;
import fr.imoblex.shared.response.ApiResponse;
import fr.imoblex.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/mandates")
@RequiredArgsConstructor
@Tag(name = "Mandats", description = "Gestion des mandats immobiliers")
public class MandateController {

    private final MandateService mandateService;

    @GetMapping
    @Operation(summary = "Liste des mandats")
    public ResponseEntity<PageResponse<MandateResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Page<MandateResponse> result = mandateService.findAll(page, size, sortBy, sortDir);
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/expiring")
    @Operation(summary = "Mandats expirant bientôt")
    public ResponseEntity<ApiResponse<List<MandateResponse>>> findExpiring(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(mandateService.findExpiringMandates(days)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un mandat")
    public ResponseEntity<ApiResponse<MandateResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(mandateService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Créer un mandat")
    public ResponseEntity<ApiResponse<MandateResponse>> create(@Valid @RequestBody MandateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(mandateService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un mandat")
    public ResponseEntity<ApiResponse<MandateResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MandateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(mandateService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un mandat")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        mandateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
