package fr.imoblex.modules.document.controller;

import fr.imoblex.modules.document.dto.DocumentResponse;
import fr.imoblex.modules.document.service.DocumentService;
import fr.imoblex.modules.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String folder,
            @RequestParam(required = false) Boolean personal,
            @RequestParam(required = false) UUID propertyId,
            @RequestParam(required = false) UUID mandateId,
            @RequestParam(required = false) UUID contactId) {

        if (Boolean.TRUE.equals(personal)) return ResponseEntity.ok(documentService.getPersonal());
        if (type != null && !type.isBlank()) return ResponseEntity.ok(documentService.getByType(type));
        if (folder != null && !folder.isBlank()) return ResponseEntity.ok(documentService.getByFolder(folder));
        if (propertyId != null) return ResponseEntity.ok(documentService.getByProperty(propertyId));
        if (mandateId != null) return ResponseEntity.ok(documentService.getByMandate(mandateId));
        if (contactId != null) return ResponseEntity.ok(documentService.getByContact(contactId));
        return ResponseEntity.ok(documentService.getAll());
    }

    @GetMapping("/folders")
    public ResponseEntity<List<String>> getFolders() {
        return ResponseEntity.ok(documentService.getFolders());
    }

    @PostMapping("/folders")
    public ResponseEntity<Map<String, String>> createFolder(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) return ResponseEntity.badRequest().build();
        documentService.createFolder(name.trim());
        return ResponseEntity.ok(Map.of("name", name.trim()));
    }

    @DeleteMapping("/folders/{name}")
    public ResponseEntity<Void> deleteFolder(@PathVariable String name) {
        documentService.deleteFolder(name);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "OTHER") String type,
            @RequestParam(value = "folderPath", required = false) String folderPath,
            @RequestParam(value = "propertyId", required = false) String propertyId,
            @RequestParam(value = "mandateId", required = false) String mandateId,
            @RequestParam(value = "contactId", required = false) String contactId,
            @AuthenticationPrincipal User uploader) throws Exception {

        return ResponseEntity.ok(documentService.upload(file, type, folderPath, propertyId, mandateId, contactId, uploader));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        documentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
