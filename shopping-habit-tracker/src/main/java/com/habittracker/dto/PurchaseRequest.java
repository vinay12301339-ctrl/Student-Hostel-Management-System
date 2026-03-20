package com.habittracker.dto;

import com.habittracker.model.Purchase;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PurchaseRequest {

    @NotBlank
    private String itemName;

    @NotNull
    private Purchase.Category category;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal amount;

    private String shopName;
    private String currency = "USD";
    private Purchase.MoodAtPurchase moodAtPurchase;
    private String moodNote;
    private boolean isImpulseBuy;
    private boolean isWishlistItem;
    private String notes;
    private LocalDateTime purchasedAt;
    private String weatherAtPurchase;
    private String color;
}
