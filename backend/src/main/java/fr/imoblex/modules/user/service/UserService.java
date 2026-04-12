package fr.imoblex.modules.user.service;

import fr.imoblex.modules.user.dto.CreateUserRequest;
import fr.imoblex.modules.user.dto.UpdateUserRequest;
import fr.imoblex.modules.user.dto.UserResponse;
import fr.imoblex.modules.user.entity.Role;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.modules.user.mapper.UserMapper;
import fr.imoblex.modules.user.repository.UserRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /** Liste tous les utilisateurs (actifs et désactivés) — réservé aux admins */
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /** Liste les agents actifs uniquement (pour les sélecteurs) */
    @Transactional(readOnly = true)
    public List<UserResponse> findActiveAgents() {
        return userRepository.findByRoleAndEnabledTrue(Role.USER).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + id));
    }

    /** Créer un nouvel utilisateur (admin uniquement) */
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Cet identifiant est déjà utilisé");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cette adresse email est déjà utilisée");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .title(request.getTitle())
                .phone(request.getPhone())
                .enabled(true)
                .build();
        return userMapper.toResponse(userRepository.save(user));
    }

    /** Mettre à jour un utilisateur */
    public UserResponse update(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + id));
        if (request.getFirstName() != null)  user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)   user.setLastName(request.getLastName());
        if (request.getPhone() != null)      user.setPhone(request.getPhone());
        if (request.getMobile() != null)     user.setMobile(request.getMobile());
        if (request.getTitle() != null)      user.setTitle(request.getTitle());
        if (request.getAvatarUrl() != null)  user.setAvatarUrl(request.getAvatarUrl());
        // Champs réservés à l'admin
        if (request.getRole() != null)       user.setRole(request.getRole());
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    /** Désactiver un utilisateur (soft delete) */
    public void disable(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + id));
        user.setEnabled(false);
        userRepository.save(user);
    }

    /** Supprimer définitivement un utilisateur */
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur introuvable: " + id);
        }
        userRepository.deleteById(id);
    }

    /** Réactiver un utilisateur désactivé */
    public UserResponse enable(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable: " + id));
        user.setEnabled(true);
        return userMapper.toResponse(userRepository.save(user));
    }
}
