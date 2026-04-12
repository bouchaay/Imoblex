package fr.imoblex.modules.rental.controller;

import fr.imoblex.modules.rental.dto.*;
import fr.imoblex.modules.rental.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rental")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    // Leases
    @GetMapping("/leases")
    public ResponseEntity<List<RentalLeaseResponse>> getAllLeases(@RequestParam(required = false) String status) {
        if ("ACTIVE".equals(status)) return ResponseEntity.ok(rentalService.getActiveLeases());
        return ResponseEntity.ok(rentalService.getAllLeases());
    }

    @GetMapping("/leases/{id}")
    public ResponseEntity<RentalLeaseResponse> getLease(@PathVariable UUID id) {
        return ResponseEntity.ok(rentalService.getLeaseById(id));
    }

    @GetMapping("/leases/by-tenant/{tenantId}")
    public ResponseEntity<List<RentalLeaseResponse>> getLeasesByTenant(@PathVariable UUID tenantId) {
        return ResponseEntity.ok(rentalService.getLeasesByTenant(tenantId));
    }

    @GetMapping("/leases/by-property/{propertyId}")
    public ResponseEntity<List<RentalLeaseResponse>> getLeasesByProperty(@PathVariable UUID propertyId) {
        return ResponseEntity.ok(rentalService.getLeasesByProperty(propertyId));
    }

    @PostMapping("/leases")
    public ResponseEntity<RentalLeaseResponse> createLease(@RequestBody RentalLeaseRequest req) {
        return ResponseEntity.ok(rentalService.createLease(req));
    }

    @PutMapping("/leases/{id}")
    public ResponseEntity<RentalLeaseResponse> updateLease(@PathVariable UUID id, @RequestBody RentalLeaseRequest req) {
        return ResponseEntity.ok(rentalService.updateLease(id, req));
    }

    @PatchMapping("/leases/{id}/terminate")
    public ResponseEntity<RentalLeaseResponse> terminateLease(@PathVariable UUID id) {
        return ResponseEntity.ok(rentalService.terminateLease(id));
    }

    // Payments
    @GetMapping("/leases/{leaseId}/payments")
    public ResponseEntity<List<RentalPaymentResponse>> getPayments(@PathVariable UUID leaseId) {
        return ResponseEntity.ok(rentalService.getPaymentsByLease(leaseId));
    }

    @PostMapping("/leases/{leaseId}/payments")
    public ResponseEntity<RentalPaymentResponse> addPayment(@PathVariable UUID leaseId, @RequestBody RentalPaymentRequest req) {
        return ResponseEntity.ok(rentalService.addPayment(leaseId, req));
    }

    @PutMapping("/payments/{id}")
    public ResponseEntity<RentalPaymentResponse> updatePayment(@PathVariable UUID id, @RequestBody RentalPaymentRequest req) {
        return ResponseEntity.ok(rentalService.updatePayment(id, req));
    }

    @DeleteMapping("/payments/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
        rentalService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/payments/{id}/quittance")
    public ResponseEntity<RentalPaymentResponse> markQuittance(@PathVariable UUID id) {
        return ResponseEntity.ok(rentalService.markQuittanceGenerated(id));
    }
}
