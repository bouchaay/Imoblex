package fr.imoblex.modules.document.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class DocumentResponse {
    private UUID id;
    private String name;
    private String type;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private UUID propertyId;
    private String propertyReference;
    private UUID mandateId;
    private String mandateReference;
    private UUID contactId;
    private String contactName;
    private UUID transactionId;
    private String uploadedByName;
    private String notes;
    private String folderPath;
    private LocalDateTime createdAt;
}
