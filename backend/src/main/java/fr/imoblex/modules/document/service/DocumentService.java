package fr.imoblex.modules.document.service;

import fr.imoblex.modules.contact.repository.ContactRepository;
import fr.imoblex.modules.document.dto.DocumentResponse;
import fr.imoblex.modules.document.entity.Document;
import fr.imoblex.modules.document.entity.DocumentFolder;
import fr.imoblex.modules.document.repository.DocumentFolderRepository;
import fr.imoblex.modules.document.repository.DocumentRepository;
import fr.imoblex.modules.mandate.repository.MandateRepository;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.property.service.PhotoStorageService;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFolderRepository folderRepository;
    private final PhotoStorageService storageService;
    private final PropertyRepository propertyRepository;
    private final MandateRepository mandateRepository;
    private final ContactRepository contactRepository;

    @Transactional
    public DocumentResponse upload(MultipartFile file, String type, String folderPath,
                                   String propertyId, String mandateId, String contactId,
                                   User uploader) throws IOException {
        String url = storageService.store(file, "documents");
        Document.DocumentBuilder builder = Document.builder()
                .name(file.getOriginalFilename())
                .type(type != null ? type.toUpperCase() : "OTHER")
                .fileUrl(url)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .folderPath(folderPath)
                .uploadedBy(uploader);

        if (propertyId != null && !propertyId.isBlank()) {
            propertyRepository.findById(UUID.fromString(propertyId))
                    .ifPresent(builder::property);
        }
        if (mandateId != null && !mandateId.isBlank()) {
            mandateRepository.findById(UUID.fromString(mandateId))
                    .ifPresent(builder::mandate);
        }
        if (contactId != null && !contactId.isBlank()) {
            contactRepository.findById(UUID.fromString(contactId))
                    .ifPresent(builder::contact);
        }

        return toResponse(documentRepository.save(builder.build()));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getAll() {
        return documentRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByType(String type) {
        return documentRepository.findByTypeOrderByCreatedAtDesc(type.toUpperCase()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getPersonal() {
        return documentRepository.findPersonal().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByFolder(String folder) {
        return documentRepository.findByFolderPathStartingWithOrderByCreatedAtDesc(folder).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByProperty(UUID propertyId) {
        return documentRepository.findByProperty_IdOrderByCreatedAtDesc(propertyId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByMandate(UUID mandateId) {
        return documentRepository.findByMandate_IdOrderByCreatedAtDesc(mandateId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByContact(UUID contactId) {
        return documentRepository.findByContact_IdOrderByCreatedAtDesc(contactId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<String> getFolders() {
        return folderRepository.findAllNames();
    }

    @Transactional
    public String createFolder(String name) {
        if (!folderRepository.existsByName(name)) {
            folderRepository.save(DocumentFolder.builder().name(name).build());
        }
        return name;
    }

    @Transactional
    public void deleteFolder(String name) {
        folderRepository.deleteByName(name);
    }

    @Transactional
    public void delete(UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé"));
        try { storageService.delete(doc.getFileUrl()); } catch (Exception ignored) {}
        documentRepository.delete(doc);
    }

    private DocumentResponse toResponse(Document d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .type(d.getType())
                .fileUrl(d.getFileUrl())
                .fileSize(d.getFileSize())
                .mimeType(d.getMimeType())
                .propertyId(d.getProperty() != null ? d.getProperty().getId() : null)
                .propertyReference(d.getProperty() != null ? d.getProperty().getReference() : null)
                .mandateId(d.getMandate() != null ? d.getMandate().getId() : null)
                .mandateReference(d.getMandate() != null ? d.getMandate().getMandateNumber() : null)
                .contactId(d.getContact() != null ? d.getContact().getId() : null)
                .contactName(d.getContact() != null ? d.getContact().getFirstName() + " " + d.getContact().getLastName() : null)
                .uploadedByName(d.getUploadedBy() != null ? d.getUploadedBy().getFirstName() + " " + d.getUploadedBy().getLastName() : null)
                .notes(d.getNotes())
                .folderPath(d.getFolderPath())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
