package fr.imoblex.modules.agency.controller;

import fr.imoblex.modules.agency.dto.AgencySettingsRequest;
import fr.imoblex.modules.agency.dto.AgencySettingsResponse;
import fr.imoblex.modules.agency.service.AgencySettingsService;
import fr.imoblex.modules.property.service.PhotoStorageService;
import fr.imoblex.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/agency-settings")
@RequiredArgsConstructor
@Slf4j
public class AgencySettingsController {

    private final AgencySettingsService service;
    private final PhotoStorageService photoStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<AgencySettingsResponse>> get() {
        return ResponseEntity.ok(ApiResponse.success(service.get()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<AgencySettingsResponse>> update(@RequestBody AgencySettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.update(request)));
    }

    @PostMapping("/signature")
    public ResponseEntity<ApiResponse<AgencySettingsResponse>> uploadSignature(
            @RequestParam("file") MultipartFile file) {
        try {
            String url = photoStorageService.store(file, "agency");
            AgencySettingsRequest req = new AgencySettingsRequest();
            req.setSignatureImagePath(url);
            return ResponseEntity.ok(ApiResponse.success(service.update(req)));
        } catch (IOException e) {
            log.error("Erreur upload signature: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/logo")
    public ResponseEntity<ApiResponse<AgencySettingsResponse>> uploadLogo(
            @RequestParam("file") MultipartFile file) {
        try {
            String url = photoStorageService.store(file, "agency");
            AgencySettingsRequest req = new AgencySettingsRequest();
            req.setLogoPath(url);
            return ResponseEntity.ok(ApiResponse.success(service.update(req)));
        } catch (IOException e) {
            log.error("Erreur upload logo: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
