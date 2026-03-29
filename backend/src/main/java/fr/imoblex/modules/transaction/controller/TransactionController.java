package fr.imoblex.modules.transaction.controller;

import fr.imoblex.modules.transaction.dto.TransactionRequest;
import fr.imoblex.modules.transaction.dto.TransactionResponse;
import fr.imoblex.modules.transaction.service.TransactionService;
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

import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Gestion des transactions immobilières")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Liste des transactions")
    public ResponseEntity<PageResponse<TransactionResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TransactionResponse> result = transactionService.findAll(page, size);
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une transaction")
    public ResponseEntity<ApiResponse<TransactionResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Créer une transaction")
    public ResponseEntity<ApiResponse<TransactionResponse>> create(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(transactionService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une transaction")
    public ResponseEntity<ApiResponse<TransactionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une transaction")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
