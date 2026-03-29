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
        if (!userRepository.existsByEmail("admin@imoblex.fr")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Imoblex")
                    .email("admin@imoblex.fr")
                    .password(passwordEncoder.encode("Admin@2024"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin créé: admin@imoblex.fr / Admin@2024");
        }
        if (!userRepository.existsByEmail("agent@imoblex.fr")) {
            User agent = User.builder()
                    .firstName("Sophie")
                    .lastName("Moreau")
                    .email("agent@imoblex.fr")
                    .password(passwordEncoder.encode("Agent@2024"))
                    .role(Role.AGENT)
                    .title("Négociatrice")
                    .enabled(true)
                    .build();
            userRepository.save(agent);
            log.info("Agent créé: agent@imoblex.fr / Agent@2024");
        }
    }
}
