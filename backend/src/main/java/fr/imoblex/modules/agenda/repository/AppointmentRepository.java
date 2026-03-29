package fr.imoblex.modules.agenda.repository;

import fr.imoblex.modules.agenda.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Page<Appointment> findByAgent_Id(UUID agentId, Pageable pageable);

    List<Appointment> findByStartAtBetweenOrderByStartAtAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.agent.id = :agentId AND a.startAt >= :now " +
            "AND a.status IN ('PLANNED','CONFIRMED') ORDER BY a.startAt ASC")
    List<Appointment> findUpcomingByAgent(UUID agentId, LocalDateTime now, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.startAt >= :now " +
            "AND a.status IN ('PLANNED','CONFIRMED') ORDER BY a.startAt ASC")
    List<Appointment> findAllUpcoming(LocalDateTime now, Pageable pageable);
}
