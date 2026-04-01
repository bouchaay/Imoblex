package fr.imoblex.modules.property.service;

import fr.imoblex.modules.property.dto.PropertyResponse;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.entity.PropertyPhoto;
import fr.imoblex.modules.property.repository.PropertyPhotoRepository;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhotoStorageService {

    private final PropertyRepository propertyRepository;
    private final PropertyPhotoRepository photoRepository;

    @Value("${imoblex.uploads.dir:./uploads}")
    private String uploadsDir;

    @Value("${imoblex.uploads.base-url:http://localhost:8080/api/uploads}")
    private String uploadsBaseUrl;

    @Transactional
    public void deletePhoto(UUID propertyId, UUID photoId) {
        PropertyPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo introuvable: " + photoId));

        // Supprimer le fichier du disque
        try {
            String filename = photo.getUrl().substring(photo.getUrl().lastIndexOf('/') + 1);
            Path file = Paths.get(uploadsDir, "properties", propertyId.toString(), filename);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("Impossible de supprimer le fichier photo: {}", e.getMessage());
        }

        photoRepository.delete(photo);
        log.info("Photo supprimée: {}", photoId);
    }

    public void deletePropertyFolder(UUID propertyId) {
        Path folder = Paths.get(uploadsDir, "properties", propertyId.toString());
        if (Files.exists(folder)) {
            try {
                Files.walk(folder)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> {
                        try { Files.delete(p); } catch (IOException e) {
                            log.warn("Impossible de supprimer: {}", p);
                        }
                    });
                log.info("Dossier photos supprimé: {}", folder);
            } catch (IOException e) {
                log.warn("Erreur suppression dossier photos {}: {}", folder, e.getMessage());
            }
        }
    }

    @Transactional
    public List<PropertyResponse.PhotoDto> uploadPhotos(UUID propertyId, MultipartFile[] files) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + propertyId));

        Path dir = Paths.get(uploadsDir, "properties", propertyId.toString());
        try {
            Files.createDirectories(dir);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload", e);
        }

        int nextPosition = (int) photoRepository.countByProperty(property);
        List<PropertyResponse.PhotoDto> result = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String ext = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;
            Path dest = dir.resolve(filename);

            try {
                file.transferTo(dest);
            } catch (IOException e) {
                log.error("Erreur upload photo: {}", filename, e);
                continue;
            }

            String url = uploadsBaseUrl + "/properties/" + propertyId + "/" + filename;

            PropertyPhoto photo = PropertyPhoto.builder()
                    .property(property)
                    .url(url)
                    .thumbnailUrl(url)
                    .position(nextPosition++)
                    .build();
            photo = photoRepository.save(photo);

            result.add(PropertyResponse.PhotoDto.builder()
                    .id(photo.getId())
                    .url(url)
                    .thumbnailUrl(url)
                    .position(photo.getPosition())
                    .build());
        }

        return result;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
