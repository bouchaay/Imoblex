package fr.imoblex.modules.lead.controller;

import fr.imoblex.modules.lead.dto.LeadResponse;
import fr.imoblex.modules.lead.dto.LeadSubmitRequest;
import fr.imoblex.modules.lead.service.LeadService;
import fr.imoblex.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    /** Endpoint public — soumission depuis le site web (pas d'authentification requise) */
    @PostMapping("/public/leads")
    public ResponseEntity<ApiResponse<LeadResponse>> submit(@Valid @RequestBody LeadSubmitRequest req) {
        return ResponseEntity.ok(ApiResponse.success(leadService.submit(req)));
    }

    /** Endpoints CRM — protégés */
    @GetMapping("/leads")
    public ResponseEntity<List<LeadResponse>> getActive() {
        return ResponseEntity.ok(leadService.getActive());
    }

    @GetMapping("/leads/archives")
    public ResponseEntity<List<LeadResponse>> getArchived() {
        return ResponseEntity.ok(leadService.getArchived());
    }

    @GetMapping("/leads/count-unread")
    public ResponseEntity<Map<String, Long>> countUnread() {
        return ResponseEntity.ok(Map.of("count", leadService.countUnread()));
    }

    @PatchMapping("/leads/{id}/read")
    public ResponseEntity<LeadResponse> markRead(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.markRead(id));
    }

    @PatchMapping("/leads/{id}/archive")
    public ResponseEntity<LeadResponse> archive(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.archive(id));
    }

    @PatchMapping("/leads/{id}/unarchive")
    public ResponseEntity<LeadResponse> unarchive(@PathVariable UUID id) {
        return ResponseEntity.ok(leadService.unarchive(id));
    }

    @DeleteMapping("/leads/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        leadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
