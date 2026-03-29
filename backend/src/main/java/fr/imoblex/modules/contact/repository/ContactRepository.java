package fr.imoblex.modules.contact.repository;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.enums.ContactStatus;
import fr.imoblex.modules.contact.enums.ContactType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID>, JpaSpecificationExecutor<Contact> {

    Page<Contact> findByType(ContactType type, Pageable pageable);

    Page<Contact> findByStatus(ContactStatus status, Pageable pageable);

    long countByType(ContactType type);

    long countByStatus(ContactStatus status);

    @Query("SELECT c FROM Contact c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR LOWER(c.email) LIKE LOWER(CONCAT('%',:q,'%')) " +
            "OR c.phone LIKE CONCAT('%',:q,'%')")
    Page<Contact> search(String q, Pageable pageable);
}
