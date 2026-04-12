package fr.imoblex.modules.document.repository;

import fr.imoblex.modules.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    List<Document> findByProperty_IdOrderByCreatedAtDesc(UUID propertyId);
    List<Document> findByMandate_IdOrderByCreatedAtDesc(UUID mandateId);
    List<Document> findByContact_IdOrderByCreatedAtDesc(UUID contactId);
    List<Document> findByTypeOrderByCreatedAtDesc(String type);
    List<Document> findByFolderPathStartingWithOrderByCreatedAtDesc(String folderPath);

    @Query("SELECT d FROM Document d WHERE d.property IS NULL AND d.mandate IS NULL AND d.contact IS NULL AND d.transaction IS NULL ORDER BY d.createdAt DESC")
    List<Document> findPersonal();

    List<Document> findAllByOrderByCreatedAtDesc();

    @Query("SELECT DISTINCT d.folderPath FROM Document d WHERE d.folderPath IS NOT NULL ORDER BY d.folderPath")
    List<String> findAllFolderPaths();
}
