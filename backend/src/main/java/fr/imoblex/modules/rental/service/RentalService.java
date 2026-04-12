package fr.imoblex.modules.rental.service;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.repository.ContactRepository;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.enums.PropertyStatus;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.rental.dto.*;
import fr.imoblex.modules.rental.entity.RentalLease;
import fr.imoblex.modules.rental.entity.RentalPayment;
import fr.imoblex.modules.rental.enums.*;
import fr.imoblex.modules.rental.repository.RentalLeaseRepository;
import fr.imoblex.modules.rental.repository.RentalPaymentRepository;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalLeaseRepository leaseRepository;
    private final RentalPaymentRepository paymentRepository;
    private final PropertyRepository propertyRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    // ─── LEASE CRUD ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RentalLeaseResponse> getAllLeases() {
        return leaseRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::toLeaseResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalLeaseResponse> getActiveLeases() {
        return leaseRepository.findByStatusOrderByStartDateDesc(LeaseStatus.ACTIVE).stream()
                .map(this::toLeaseResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RentalLeaseResponse getLeaseById(UUID id) {
        return toLeaseResponse(leaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location introuvable")));
    }

    @Transactional(readOnly = true)
    public List<RentalLeaseResponse> getLeasesByTenant(UUID tenantId) {
        return leaseRepository.findByTenantIdOrderByStartDateDesc(tenantId).stream()
                .map(this::toLeaseResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalLeaseResponse> getLeasesByProperty(UUID propertyId) {
        return leaseRepository.findByPropertyIdOrderByStartDateDesc(propertyId).stream()
                .map(this::toLeaseResponse).collect(Collectors.toList());
    }

    @Transactional
    public RentalLeaseResponse createLease(RentalLeaseRequest req) {
        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Bien introuvable"));
        Contact tenant = contactRepository.findById(req.getTenantId())
                .orElseThrow(() -> new RuntimeException("Locataire introuvable"));

        Contact landlord = req.getLandlordId() != null
                ? contactRepository.findById(req.getLandlordId()).orElse(null) : null;
        User agent = req.getAgentId() != null
                ? userRepository.findById(req.getAgentId()).orElse(null) : null;

        LeaseStatus status = req.getStatus() != null
                ? LeaseStatus.valueOf(req.getStatus()) : LeaseStatus.PENDING;

        RentalLease lease = RentalLease.builder()
                .property(property)
                .tenant(tenant)
                .landlord(landlord)
                .agent(agent)
                .leaseType(req.getLeaseType() != null ? LeaseType.valueOf(req.getLeaseType()) : LeaseType.UNFURNISHED)
                .status(status)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .rentAmount(req.getRentAmount())
                .chargesAmount(req.getChargesAmount() != null ? req.getChargesAmount() : BigDecimal.ZERO)
                .depositAmount(req.getDepositAmount())
                .paymentDayOfMonth(req.getPaymentDayOfMonth() != null ? req.getPaymentDayOfMonth() : 1)
                .paymentMethod(req.getPaymentMethod() != null ? PaymentMethod.valueOf(req.getPaymentMethod()) : PaymentMethod.TRANSFER)
                .renewalDate(req.getRenewalDate())
                .notes(req.getNotes())
                .build();

        RentalLease saved = leaseRepository.save(lease);

        // Auto-update property status
        if (status == LeaseStatus.ACTIVE) {
            property.setStatus(PropertyStatus.RENTED);
            propertyRepository.save(property);
        }

        return toLeaseResponse(saved);
    }

    @Transactional
    public RentalLeaseResponse updateLease(UUID id, RentalLeaseRequest req) {
        RentalLease lease = leaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        LeaseStatus oldStatus = lease.getStatus();

        if (req.getPropertyId() != null) {
            lease.setProperty(propertyRepository.findById(req.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Bien introuvable")));
        }
        if (req.getTenantId() != null) {
            lease.setTenant(contactRepository.findById(req.getTenantId())
                    .orElseThrow(() -> new RuntimeException("Locataire introuvable")));
        }
        if (req.getLandlordId() != null)
            lease.setLandlord(contactRepository.findById(req.getLandlordId()).orElse(null));
        if (req.getAgentId() != null)
            lease.setAgent(userRepository.findById(req.getAgentId()).orElse(null));
        if (req.getLeaseType() != null) lease.setLeaseType(LeaseType.valueOf(req.getLeaseType()));
        if (req.getStatus() != null) lease.setStatus(LeaseStatus.valueOf(req.getStatus()));
        if (req.getStartDate() != null) lease.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) lease.setEndDate(req.getEndDate());
        if (req.getRentAmount() != null) lease.setRentAmount(req.getRentAmount());
        if (req.getChargesAmount() != null) lease.setChargesAmount(req.getChargesAmount());
        if (req.getDepositAmount() != null) lease.setDepositAmount(req.getDepositAmount());
        if (req.getPaymentDayOfMonth() != null) lease.setPaymentDayOfMonth(req.getPaymentDayOfMonth());
        if (req.getPaymentMethod() != null) lease.setPaymentMethod(PaymentMethod.valueOf(req.getPaymentMethod()));
        if (req.getRenewalDate() != null) lease.setRenewalDate(req.getRenewalDate());
        lease.setNotes(req.getNotes());

        RentalLease saved = leaseRepository.save(lease);

        // Auto-update property status on status change
        LeaseStatus newStatus = saved.getStatus();
        Property property = saved.getProperty();
        if (oldStatus != newStatus) {
            if (newStatus == LeaseStatus.ACTIVE) {
                property.setStatus(PropertyStatus.RENTED);
                propertyRepository.save(property);
            } else if (newStatus == LeaseStatus.TERMINATED) {
                // Only set available if no other active lease
                if (!leaseRepository.existsByPropertyIdAndStatus(property.getId(), LeaseStatus.ACTIVE)) {
                    property.setStatus(PropertyStatus.AVAILABLE);
                    propertyRepository.save(property);
                }
            }
        }

        return toLeaseResponse(saved);
    }

    @Transactional
    public RentalLeaseResponse terminateLease(UUID id) {
        RentalLease lease = leaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));
        lease.setStatus(LeaseStatus.TERMINATED);
        RentalLease saved = leaseRepository.save(lease);

        Property property = saved.getProperty();
        if (!leaseRepository.existsByPropertyIdAndStatus(property.getId(), LeaseStatus.ACTIVE)) {
            property.setStatus(PropertyStatus.AVAILABLE);
            propertyRepository.save(property);
        }

        return toLeaseResponse(saved);
    }

    // ─── PAYMENTS ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RentalPaymentResponse> getPaymentsByLease(UUID leaseId) {
        return paymentRepository.findByLeaseIdOrderByPaymentYearDescPaymentMonthDesc(leaseId).stream()
                .map(this::toPaymentResponse).collect(Collectors.toList());
    }

    @Transactional
    public RentalPaymentResponse addPayment(UUID leaseId, RentalPaymentRequest req) {
        RentalLease lease = leaseRepository.findById(leaseId)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        BigDecimal expected = req.getExpectedAmount() != null
                ? req.getExpectedAmount() : lease.getTotalRent();
        BigDecimal paid = req.getPaidAmount() != null ? req.getPaidAmount() : BigDecimal.ZERO;
        LocalDate dueDate = req.getDueDate() != null ? req.getDueDate()
                : LocalDate.of(req.getPaymentYear(), req.getPaymentMonth(), lease.getPaymentDayOfMonth());

        PaymentStatus status = calculatePaymentStatus(expected, paid, dueDate);

        RentalPayment payment = RentalPayment.builder()
                .lease(lease)
                .paymentMonth(req.getPaymentMonth())
                .paymentYear(req.getPaymentYear())
                .expectedAmount(expected)
                .paidAmount(paid)
                .paymentDate(req.getPaymentDate())
                .dueDate(dueDate)
                .status(status)
                .paymentMethod(req.getPaymentMethod() != null ? PaymentMethod.valueOf(req.getPaymentMethod()) : null)
                .reference(req.getReference())
                .notes(req.getNotes())
                .build();

        // Only mark lease UNPAID for explicitly unpaid payments (not just late)
        if (status == PaymentStatus.UNPAID) {
            if (lease.getStatus() == LeaseStatus.ACTIVE) {
                lease.setStatus(LeaseStatus.UNPAID);
                leaseRepository.save(lease);
            }
        }

        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public RentalPaymentResponse updatePayment(UUID paymentId, RentalPaymentRequest req) {
        RentalPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable"));

        if (req.getPaidAmount() != null) payment.setPaidAmount(req.getPaidAmount());
        if (req.getExpectedAmount() != null) payment.setExpectedAmount(req.getExpectedAmount());
        if (req.getPaymentDate() != null) payment.setPaymentDate(req.getPaymentDate());
        if (req.getDueDate() != null) payment.setDueDate(req.getDueDate());
        if (req.getPaymentMethod() != null) payment.setPaymentMethod(PaymentMethod.valueOf(req.getPaymentMethod()));
        if (req.getReference() != null) payment.setReference(req.getReference());
        if (req.getNotes() != null) payment.setNotes(req.getNotes());

        PaymentStatus newStatus = calculatePaymentStatus(payment.getExpectedAmount(), payment.getPaidAmount(), payment.getDueDate());
        payment.setStatus(newStatus);

        // Revert lease to ACTIVE if payment is now paid/partial and lease was UNPAID
        RentalLease lease = payment.getLease();
        if ((newStatus == PaymentStatus.PAID || newStatus == PaymentStatus.PARTIAL)
                && lease.getStatus() == LeaseStatus.UNPAID) {
            lease.setStatus(LeaseStatus.ACTIVE);
            leaseRepository.save(lease);
        }

        return toPaymentResponse(paymentRepository.save(payment));
    }

    @Transactional
    public void deletePayment(UUID paymentId) {
        paymentRepository.deleteById(paymentId);
    }

    @Transactional
    public RentalPaymentResponse markQuittanceGenerated(UUID paymentId) {
        RentalPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable"));
        payment.setQuittanceGeneratedAt(LocalDateTime.now());
        return toPaymentResponse(paymentRepository.save(payment));
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────

    private PaymentStatus calculatePaymentStatus(BigDecimal expected, BigDecimal paid, LocalDate dueDate) {
        if (paid.compareTo(BigDecimal.ZERO) == 0) {
            return LocalDate.now().isAfter(dueDate) ? PaymentStatus.LATE : PaymentStatus.PENDING;
        }
        if (paid.compareTo(expected) >= 0) return PaymentStatus.PAID;
        return PaymentStatus.PARTIAL;
    }

    private RentalLeaseResponse toLeaseResponse(RentalLease l) {
        // Payment stats
        List<RentalPayment> payments = paymentRepository.findByLeaseIdOrderByPaymentYearDescPaymentMonthDesc(l.getId());
        long paidCount = payments.stream().filter(p -> p.getStatus() == PaymentStatus.PAID).count();

        // Current month status
        LocalDate now = LocalDate.now();
        String currentMonthStatus = payments.stream()
                .filter(p -> p.getPaymentMonth() == now.getMonthValue() && p.getPaymentYear() == now.getYear())
                .findFirst()
                .map(p -> p.getStatus().name())
                .orElseGet(() -> {
                    // No payment recorded yet — check how late we are vs payment day
                    int paymentDay = l.getPaymentDayOfMonth() != null ? l.getPaymentDayOfMonth() : 1;
                    int daysOverdue = now.getDayOfMonth() - paymentDay;
                    return daysOverdue > 5 ? "LATE" : "PENDING";
                });

        // Recalculate UNPAID status dynamically — if no payment is explicitly UNPAID, revert to ACTIVE
        LeaseStatus effectiveStatus = l.getStatus();
        if (effectiveStatus == LeaseStatus.UNPAID) {
            boolean hasUnpaid = payments.stream()
                    .anyMatch(p -> p.getStatus() == PaymentStatus.UNPAID);
            if (!hasUnpaid) {
                effectiveStatus = LeaseStatus.ACTIVE;
            }
        }

        Property prop = l.getProperty();
        Contact tenant = l.getTenant();
        Contact landlord = l.getLandlord();
        User agent = l.getAgent();

        String propertyAddress = prop != null ? (prop.getAddress() != null ? prop.getAddress() : "") + (prop.getCity() != null ? ", " + prop.getCity() : "") : "";

        return RentalLeaseResponse.builder()
                .id(l.getId())
                .propertyId(prop != null ? prop.getId() : null)
                .propertyReference(prop != null ? prop.getReference() : null)
                .propertyAddress(propertyAddress)
                .propertyCity(prop != null ? prop.getCity() : null)
                .tenantId(tenant != null ? tenant.getId() : null)
                .tenantName(tenant != null ? tenant.getFirstName() + " " + tenant.getLastName() : null)
                .tenantEmail(tenant != null ? tenant.getEmail() : null)
                .tenantPhone(tenant != null ? (tenant.getMobile() != null ? tenant.getMobile() : tenant.getPhone()) : null)
                .landlordId(landlord != null ? landlord.getId() : null)
                .landlordName(landlord != null ? landlord.getFirstName() + " " + landlord.getLastName() : null)
                .agentId(agent != null ? agent.getId() : null)
                .agentName(agent != null ? agent.getFirstName() + " " + agent.getLastName() : null)
                .leaseType(l.getLeaseType() != null ? l.getLeaseType().name() : null)
                .status(effectiveStatus != null ? effectiveStatus.name() : null)
                .startDate(l.getStartDate())
                .endDate(l.getEndDate())
                .rentAmount(l.getRentAmount())
                .chargesAmount(l.getChargesAmount())
                .totalRent(l.getTotalRent())
                .depositAmount(l.getDepositAmount())
                .paymentDayOfMonth(l.getPaymentDayOfMonth())
                .paymentMethod(l.getPaymentMethod() != null ? l.getPaymentMethod().name() : null)
                .renewalDate(l.getRenewalDate())
                .notes(l.getNotes())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .totalPayments(payments.size())
                .paidPayments((int) paidCount)
                .currentMonthStatus(currentMonthStatus)
                .build();
    }

    private RentalPaymentResponse toPaymentResponse(RentalPayment p) {
        return RentalPaymentResponse.builder()
                .id(p.getId())
                .leaseId(p.getLease().getId())
                .paymentMonth(p.getPaymentMonth())
                .paymentYear(p.getPaymentYear())
                .expectedAmount(p.getExpectedAmount())
                .paidAmount(p.getPaidAmount())
                .remainingAmount(p.getRemainingAmount())
                .paymentDate(p.getPaymentDate())
                .dueDate(p.getDueDate())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null)
                .reference(p.getReference())
                .notes(p.getNotes())
                .quittanceGeneratedAt(p.getQuittanceGeneratedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
