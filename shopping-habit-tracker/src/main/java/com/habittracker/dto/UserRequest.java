package com.habittracker.dto;

import com.habittracker.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank
    private String username;

    @Email
    @NotBlank
    private String email;

    private String displayName;

    private User.ShopperPersonality shopperPersonality = User.ShopperPersonality.EXPLORER;
}
