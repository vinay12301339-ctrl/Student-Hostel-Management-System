package com.habittracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalType type;

    @Enumerated(EnumType.STRING)
    private Purchase.Category targetCategory;

    @DecimalMin("0.0")
    private BigDecimal spendingLimit;

    private int daysWithoutBuying = 0;
    private int targetDaysWithoutBuying = 0;

    private boolean isAchieved = false;
    private boolean isActive = true;

    private LocalDate startDate = LocalDate.now();
    private LocalDate targetDate;
    private LocalDate achievedDate;

    @Column(length = 500)
    private String quirkyDescription;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum GoalType {
        SPENDING_LIMIT, NO_BUYING_STREAK, CATEGORY_AVOIDANCE, WISHLIST_ONLY, CUSTOM
    }
}
