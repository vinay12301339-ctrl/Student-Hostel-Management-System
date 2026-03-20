package com.habittracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String itemName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false)
    private BigDecimal amount;

    private String shopName;
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    private MoodAtPurchase moodAtPurchase;

    private String moodNote;
    private boolean isImpulseBuy = false;
    private boolean isWishlistItem = false;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime purchasedAt = LocalDateTime.now();

    private String weatherAtPurchase;
    private String color;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Category {
        FOOD_DRINKS, CLOTHING, ELECTRONICS, BOOKS, HOME_DECOR,
        BEAUTY_HEALTH, SPORTS, ENTERTAINMENT, TRAVEL, GIFTS, OTHER
    }

    public enum MoodAtPurchase {
        HAPPY, SAD, STRESSED, BORED, EXCITED, ANXIOUS, CONTENT, ANGRY, TIRED
    }
}
