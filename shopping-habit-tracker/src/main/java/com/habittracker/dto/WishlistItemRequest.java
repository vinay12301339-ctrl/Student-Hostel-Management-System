package com.habittracker.dto;

import com.habittracker.model.WishlistItem;
import com.habittracker.model.Purchase;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WishlistItemRequest {

    @NotBlank
    private String itemName;

    @NotNull
    private Purchase.Category category;

    @DecimalMin("0.0")
    private BigDecimal estimatedPrice;

    private String shopName;
    private String url;
    private int priority = 3;
    private String notes;
}
