package com.habittracker.dto;

import com.habittracker.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private User.ShopperPersonality shopperPersonality;
    private int totalPoints;
    private int streakDays;
    private int badgeCount;
    private LocalDateTime createdAt;
}
