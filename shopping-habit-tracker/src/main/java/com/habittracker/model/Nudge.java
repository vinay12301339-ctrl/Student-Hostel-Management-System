package com.habittracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "nudges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Nudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NudgeType type;

    @Enumerated(EnumType.STRING)
    private NudgeTrigger trigger;

    private boolean isRead = false;
    private boolean isDismissed = false;

    private String emoji;
    private String actionUrl;

    @Column(nullable = false)
    private LocalDateTime scheduledAt = LocalDateTime.now();

    private LocalDateTime readAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NudgeType {
        SPENDING_ALERT, HABIT_LOOP_WARNING, ACHIEVEMENT_UNLOCK,
        CHALLENGE_INVITE, MOOD_CHECK, STREAK_REMINDER, IMPULSE_GUARD
    }

    public enum NudgeTrigger {
        PURCHASE_MADE, DAILY_SCHEDULE, HABIT_DETECTED,
        GOAL_PROGRESS, STREAK_MILESTONE, MOOD_TRIGGER
    }
}
