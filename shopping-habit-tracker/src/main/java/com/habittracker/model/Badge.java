package com.habittracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    private String emoji;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BadgeRarity rarity;

    private int pointsAwarded = 0;

    @Column(nullable = false)
    private LocalDateTime earnedAt = LocalDateTime.now();

    public enum BadgeType {
        STREAK_BREAKER, BUDGET_MASTER, MOOD_WARRIOR, WISHLIST_KEEPER,
        IMPULSE_SLAYER, NIGHT_OWL_REFORMED, EXPLORER, MINIMALIST,
        GOAL_CRUSHER, HABIT_BUSTER
    }

    public enum BadgeRarity {
        COMMON, RARE, EPIC, LEGENDARY
    }
}
