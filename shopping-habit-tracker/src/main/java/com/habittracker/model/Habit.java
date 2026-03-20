package com.habittracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "habits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Habit {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HabitType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Frequency frequency;

    private int streakCount = 0;
    private int longestStreak = 0;
    private boolean isActive = true;
    private boolean isLooping = false;

    private LocalDate lastActiveDate;
    private LocalDate startDate = LocalDate.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum HabitType {
        IMPULSE_BUYING, LATE_NIGHT_SHOPPING, CATEGORY_SPECIFIC,
        MOOD_TRIGGERED, WEEKEND_BINGE, SUBSCRIPTION_HOARDING
    }

    public enum Frequency {
        DAILY, WEEKLY, MONTHLY
    }
}
