package fr.imoblex.modules.reporting.controller;

import fr.imoblex.modules.agenda.repository.AppointmentRepository;
import fr.imoblex.modules.contact.enums.ContactType;
import fr.imoblex.modules.contact.repository.ContactRepository;
import fr.imoblex.modules.lead.repository.LeadRepository;
import fr.imoblex.modules.mandate.repository.MandateRepository;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.transaction.entity.Transaction;
import fr.imoblex.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final PropertyRepository propertyRepository;
    private final MandateRepository mandateRepository;
    private final TransactionRepository transactionRepository;
    private final ContactRepository contactRepository;
    private final AppointmentRepository appointmentRepository;
    private final LeadRepository leadRepository;

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> dashboard() {
        LocalDate today = LocalDate.now();
        LocalDate in15Days = today.plusDays(15);
        LocalDate startOfMonth = today.withDayOfMonth(1);

        long totalProperties = propertyRepository.count();

        long activeMandates = mandateRepository.countByStatus(
                fr.imoblex.modules.mandate.enums.MandateStatus.ACTIVE);
        long expiringMandates = mandateRepository.findExpiringMandates(today, in15Days).size();

        long transactionsInProgress = transactionRepository.countByStatusIn(List.of(
                Transaction.TransactionStatus.OFFER,
                Transaction.TransactionStatus.ACCEPTED,
                Transaction.TransactionStatus.COMPROMIS,
                Transaction.TransactionStatus.FINANCING,
                Transaction.TransactionStatus.ACTE));
        BigDecimal revenue = transactionRepository.sumCompletedAgencyFees();

        long totalContacts = contactRepository.count();
        long unreadLeads = leadRepository.countUnread();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProperties", totalProperties);
        stats.put("activeMandates", activeMandates);
        stats.put("expiringMandates", expiringMandates);
        stats.put("transactionsInProgress", transactionsInProgress);
        stats.put("revenueTotal", revenue != null ? revenue : BigDecimal.ZERO);
        stats.put("totalContacts", totalContacts);
        stats.put("unreadLeads", unreadLeads);

        // Mandats expirant bientôt (liste)
        var expList = mandateRepository.findExpiringMandates(today, in15Days).stream()
                .map(m -> {
                    String address = "";
                    if (m.getProperty() != null) {
                        String street = m.getProperty().getAddress() != null ? m.getProperty().getAddress() : "";
                        String city   = m.getProperty().getCity()    != null ? m.getProperty().getCity()    : "";
                        address = (street + (street.isEmpty() || city.isEmpty() ? "" : ", ") + city).trim();
                    }
                    return Map.of(
                            "id",        m.getId().toString(),
                            "reference", m.getMandateNumber() != null ? m.getMandateNumber() : "",
                            "address",   address,
                            "endDate",   m.getEndDate() != null ? m.getEndDate().toString() : "",
                            "daysLeft",  today.until(m.getEndDate()).getDays()
                    );
                }).toList();
        stats.put("expiringMandatesList", expList);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reporting")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> reporting() {
        int currentYear = LocalDate.now().getYear();

        // ── KPIs ─────────────────────────────────────────────────────────────
        long totalProperties        = propertyRepository.count();
        long transactionsCompleted  = transactionRepository.countByStatus(Transaction.TransactionStatus.COMPLETED);
        long totalContacts          = contactRepository.count();
        BigDecimal revenueTotal     = transactionRepository.sumCompletedAgencyFees();

        // ── Honoraires mensuels (12 mois de l'année courante) ────────────────
        List<Object[]> monthlyRaw = transactionRepository.getMonthlyRevenue(currentYear);
        long[] monthlyRevenue = new long[12];
        for (Object[] row : monthlyRaw) {
            int month = ((Number) row[0]).intValue();
            long rev  = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            if (month >= 1 && month <= 12) monthlyRevenue[month - 1] = rev;
        }

        // ── Répartition biens par type ────────────────────────────────────────
        List<Object[]> propTypeRaw = propertyRepository.countByPropertyType();
        List<Map<String, Object>> propertyTypes = propTypeRaw.stream()
                .map(r -> Map.<String, Object>of(
                        "type",  r[0] != null ? r[0].toString() : "OTHER",
                        "count", ((Number) r[1]).longValue()
                ))
                .toList();

        // ── Répartition contacts par profil ───────────────────────────────────
        List<Map<String, Object>> contactTypes = new ArrayList<>();
        for (ContactType ct : ContactType.values()) {
            long cnt = contactRepository.countByType(ct);
            if (cnt > 0) {
                contactTypes.add(Map.of("type", ct.name(), "count", cnt));
            }
        }

        // ── Performance agents (transactions complétées) ──────────────────────
        List<Object[]> agentRaw = transactionRepository.getAgentPerformance();
        List<Map<String, Object>> agentPerformance = agentRaw.stream()
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("agentId",          r[0] != null ? r[0].toString() : "");
                    m.put("firstName",         r[1] != null ? r[1].toString() : "");
                    m.put("lastName",          r[2] != null ? r[2].toString() : "");
                    m.put("avatarUrl",         r[3] != null ? r[3].toString() : "");
                    m.put("transactionCount",  ((Number) r[4]).longValue());
                    m.put("revenue",           r[5] != null ? ((Number) r[5]).doubleValue() : 0.0);
                    return m;
                })
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalProperties",       totalProperties);
        result.put("transactionsCompleted", transactionsCompleted);
        result.put("revenueTotal",          revenueTotal != null ? revenueTotal : BigDecimal.ZERO);
        result.put("totalContacts",         totalContacts);
        result.put("monthlyRevenue",        monthlyRevenue);
        result.put("propertyTypes",         propertyTypes);
        result.put("contactTypes",          contactTypes);
        result.put("agentPerformance",      agentPerformance);

        return ResponseEntity.ok(result);
    }
}
