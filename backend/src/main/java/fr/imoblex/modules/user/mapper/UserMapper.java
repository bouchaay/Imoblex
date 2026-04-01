package fr.imoblex.modules.user.mapper;

import fr.imoblex.modules.user.dto.UserResponse;
import fr.imoblex.modules.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User u) {
        if (u == null) return null;
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .mobile(u.getMobile())
                .avatarUrl(u.getAvatarUrl())
                .title(u.getTitle())
                .role(u.getRole())
                .enabled(u.isEnabled())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }
}
