package fr.imoblex.modules.transaction.repository;

import fr.imoblex.modules.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByAgent_Id(UUID agentId, Pageable pageable);

    Page<Transaction> findByStatus(Transaction.TransactionStatus status, Pageable pageable);

    long countByStatus(Transaction.TransactionStatus status);

    long countByStatusIn(java.util.List<Transaction.TransactionStatus> statuses);

    @Query("SELECT SUM(t.agencyFees) FROM Transaction t WHERE t.status = 'COMPLETED'")
    BigDecimal sumCompletedAgencyFees();

    @Query(value = "SELECT EXTRACT(MONTH FROM completion_date) AS month, COALESCE(SUM(agency_fees), 0) AS revenue " +
            "FROM transactions WHERE status = 'COMPLETED' AND completion_date IS NOT NULL " +
            "AND EXTRACT(YEAR FROM completion_date) = :year " +
            "GROUP BY EXTRACT(MONTH FROM completion_date) ORDER BY month", nativeQuery = true)
    List<Object[]> getMonthlyRevenue(@Param("year") int year);

    @Query(value = "SELECT u.id::text, u.first_name, u.last_name, u.avatar_url, COUNT(t.id), COALESCE(SUM(t.agency_fees), 0) " +
            "FROM transactions t JOIN users u ON t.agent_id = u.id " +
            "WHERE t.status = 'COMPLETED' " +
            "GROUP BY u.id, u.first_name, u.last_name, u.avatar_url " +
            "ORDER BY SUM(t.agency_fees) DESC NULLS LAST LIMIT 10", nativeQuery = true)
    List<Object[]> getAgentPerformance();
}
