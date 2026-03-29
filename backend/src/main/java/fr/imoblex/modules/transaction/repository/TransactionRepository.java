package fr.imoblex.modules.transaction.repository;

import fr.imoblex.modules.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByAgent_Id(UUID agentId, Pageable pageable);

    Page<Transaction> findByStatus(Transaction.TransactionStatus status, Pageable pageable);

    long countByStatus(Transaction.TransactionStatus status);

    @Query("SELECT SUM(t.agencyFees) FROM Transaction t WHERE t.status = 'COMPLETED'")
    BigDecimal sumCompletedAgencyFees();
}
