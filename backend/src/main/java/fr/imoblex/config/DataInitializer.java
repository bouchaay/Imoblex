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
        if (userRepository.existsByUsername("root")) {
            log.info("✅ Utilisateur root déjà initialisé — aucune action requise");
            return;
        }
        User root = User.builder()
                .username("root")
                .firstName("Admin")
                .lastName("Imoblex")
                .email("root@imoblex.fr")
                .password(passwordEncoder.encode("root"))
                .role(Role.ADMIN)
                .title("Administrateur")
                .enabled(true)
                .build();
        userRepository.save(root);
        log.info("✅ Premier utilisateur créé — identifiants : root / root");
    }
}
