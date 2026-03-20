package com.habittracker.dto;

import com.habittracker.model.Purchase;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PurchaseResponse {
    private Long id;
    private String itemName;
    private Purchase.Category category;
    private BigDecimal amount;
    private String currency;
    private String shopName;
    private Purchase.MoodAtPurchase moodAtPurchase;
    private String moodNote;
    private boolean isImpulseBuy;
    private boolean isWishlistItem;
    private String notes;
    private LocalDateTime purchasedAt;
    private String weatherAtPurchase;
    private String color;
    private LocalDateTime createdAt;
}
