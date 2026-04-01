package fr.imoblex.config;

import fr.imoblex.modules.user.entity.Role;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createOrUpdate("admin",  "Admin",  "Imoblex",  "admin@imoblex.fr",  "Admin@2024",  Role.ADMIN, "Directeur d'agence");
        createOrUpdate("sophie", "Sophie", "Moreau",   "sophie.moreau@imoblex.fr", "Sophie@2024", Role.USER, "Négociatrice");
    }

    private void createOrUpdate(String username, String firstName, String lastName,
                                String email, String rawPassword, Role role, String title) {
        String encodedPassword = passwordEncoder.encode(rawPassword);

        userRepository.findByUsername(username).ifPresentOrElse(
            user -> {
                // Mettre à jour le mot de passe et le rôle à chaque démarrage (dev)
                user.setPassword(encodedPassword);
                user.setRole(role);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setEmail(email);
                user.setTitle(title);
                user.setEnabled(true);
                userRepository.save(user);
                log.info("✅ Utilisateur mis à jour — login: IMB01 / {} / {}", username, rawPassword);
            },
            () -> {
                User user = User.builder()
                        .username(username)
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .password(encodedPassword)
                        .role(role)
                        .title(title)
                        .enabled(true)
                        .build();
                userRepository.save(user);
                log.info("✅ Utilisateur créé — login: IMB01 / {} / {}", username, rawPassword);
            }
        );
    }
}
