package fr.imoblex.modules.mandate.controller;

import fr.imoblex.modules.mandate.dto.MandateRequest;
import fr.imoblex.modules.mandate.dto.MandateResponse;
import fr.imoblex.modules.mandate.service.MandateDocumentService;
import fr.imoblex.modules.mandate.service.MandateService;
import fr.imoblex.shared.response.ApiResponse;
import fr.imoblex.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/mandates")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Mandats", description = "Gestion des mandats immobiliers")
public class MandateController {

    private final MandateService mandateService;
    private final MandateDocumentService mandateDocumentService;

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

    @GetMapping("/{id}/document")
    @Operation(summary = "Générer le PDF du mandat")
    public ResponseEntity<byte[]> generateDocument(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "true") boolean signed,
            @RequestParam(required = false) String remiseDate,
            @RequestParam(defaultValue = "false") boolean blank) {
        try {
            byte[] pdf = mandateDocumentService.generateGerance(id, signed, remiseDate, blank);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("mandat-" + id + ".pdf")
                    .build());
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            log.error("Erreur génération PDF mandat {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
