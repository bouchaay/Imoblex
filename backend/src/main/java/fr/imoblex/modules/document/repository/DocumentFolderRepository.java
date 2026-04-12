package fr.imoblex.modules.document.repository;

import fr.imoblex.modules.document.entity.DocumentFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentFolderRepository extends JpaRepository<DocumentFolder, UUID> {

    boolean existsByName(String name);

    @Query("SELECT f.name FROM DocumentFolder f ORDER BY f.name")
    List<String> findAllNames();

    void deleteByName(String name);
}
