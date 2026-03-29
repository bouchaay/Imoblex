package fr.imoblex.modules.contact.controller;

import fr.imoblex.modules.contact.dto.ContactRequest;
import fr.imoblex.modules.contact.dto.ContactResponse;
import fr.imoblex.modules.contact.dto.ContactSearchRequest;
import fr.imoblex.modules.contact.service.ContactService;
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
@RequestMapping("/contacts")
@RequiredArgsConstructor
@Tag(name = "Contacts", description = "CRM - Gestion des contacts")
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    @Operation(summary = "Recherche et liste des contacts")
    public ResponseEntity<PageResponse<ContactResponse>> search(ContactSearchRequest request) {
        Page<ContactResponse> page = contactService.search(request);
        return ResponseEntity.ok(PageResponse.of(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un contact")
    public ResponseEntity<ApiResponse<ContactResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(contactService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Créer un contact")
    public ResponseEntity<ApiResponse<ContactResponse>> create(@Valid @RequestBody ContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(contactService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un contact")
    public ResponseEntity<ApiResponse<ContactResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(ApiResponse.success(contactService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un contact")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
