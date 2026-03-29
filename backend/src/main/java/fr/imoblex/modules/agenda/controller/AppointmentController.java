package fr.imoblex.modules.agenda.controller;

import fr.imoblex.modules.agenda.dto.AppointmentRequest;
import fr.imoblex.modules.agenda.dto.AppointmentResponse;
import fr.imoblex.modules.agenda.service.AgendaService;
import fr.imoblex.shared.response.ApiResponse;
import fr.imoblex.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Agenda", description = "Gestion des rendez-vous")
public class AppointmentController {

    private final AgendaService agendaService;

    @GetMapping
    @Operation(summary = "Liste des rendez-vous")
    public ResponseEntity<PageResponse<AppointmentResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentResponse> result = agendaService.findAll(page, size);
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @GetMapping("/range")
    @Operation(summary = "RDV entre deux dates")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> findByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(agendaService.findByDateRange(start, end)));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Prochains rendez-vous")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> findUpcoming(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(agendaService.findUpcoming(limit)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(agendaService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Créer un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> create(@Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(agendaService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un rendez-vous")
    public ResponseEntity<ApiResponse<AppointmentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(agendaService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un rendez-vous")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        agendaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
