package fr.imoblex.modules.auth.service;

import fr.imoblex.modules.auth.dto.AuthResponse;
import fr.imoblex.modules.auth.dto.ChangePasswordRequest;
import fr.imoblex.modules.auth.dto.LoginRequest;
import fr.imoblex.modules.auth.dto.RegisterRequest;
import fr.imoblex.modules.user.dto.UserResponse;
import fr.imoblex.modules.user.entity.Role;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.modules.user.mapper.UserMapper;
import fr.imoblex.modules.user.repository.UserRepository;
import fr.imoblex.security.jwt.JwtService;
import fr.imoblex.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;

    @Value("${imoblex.agency.code}")
    private String agencyCode;

    public AuthResponse login(LoginRequest request) {
        // 1. Vérification du code agence
        if (!agencyCode.equalsIgnoreCase(request.getAgencyCode())) {
            throw new BusinessException("Code agence invalide");
        }

        // 2. Authentification username + password
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new BusinessException("Identifiant ou mot de passe incorrect");
        }

        // 3. Charger l'utilisateur
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));

        if (!user.isEnabled()) {
            throw new BusinessException("Compte désactivé, contactez votre administrateur");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("Login réussi: {} (agence: {})", user.getUsername(), request.getAgencyCode());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(userMapper.toResponse(user))
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Identifiant déjà utilisé");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email déjà utilisé: " + request.getEmail());
        }
        User user = User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .mobile(request.getMobile())
                .title(request.getTitle())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .enabled(true)
                .build();
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        log.info("Utilisateur créé: {}", user.getUsername());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(userMapper.toResponse(user))
                .build();
    }

    public AuthResponse refresh(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new BusinessException("Refresh token invalide ou expiré");
        }
        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(userMapper.toResponse(user))
                .build();
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Les mots de passe ne correspondent pas");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Mot de passe actuel incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Mot de passe modifié pour: {}", username);
    }

    @Transactional(readOnly = true)
    public UserResponse me(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable"));
        return userMapper.toResponse(user);
    }
}
