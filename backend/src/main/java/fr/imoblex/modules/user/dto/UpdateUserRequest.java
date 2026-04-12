package fr.imoblex.modules.user.dto;

import fr.imoblex.modules.user.entity.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String phone;
    private String mobile;
    private String title;
    private String avatarUrl;
    // Admin-only fields
    private Role role;
    private String newPassword;
}
