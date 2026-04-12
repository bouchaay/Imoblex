package fr.imoblex.modules.rental.repository;

import fr.imoblex.modules.rental.entity.RentalPayment;
import fr.imoblex.modules.rental.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentalPaymentRepository extends JpaRepository<RentalPayment, UUID> {
    List<RentalPayment> findByLeaseIdOrderByPaymentYearDescPaymentMonthDesc(UUID leaseId);
    Optional<RentalPayment> findByLeaseIdAndPaymentMonthAndPaymentYear(UUID leaseId, int month, int year);
    List<RentalPayment> findByLeaseIdAndStatus(UUID leaseId, PaymentStatus status);
    long countByLeaseIdAndStatus(UUID leaseId, PaymentStatus status);
}
