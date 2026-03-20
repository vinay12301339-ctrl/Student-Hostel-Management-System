package com.habittracker.dto;

import com.habittracker.model.Goal;
import com.habittracker.model.Purchase;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private Goal.GoalType type;

    private Purchase.Category targetCategory;
    private BigDecimal spendingLimit;
    private int targetDaysWithoutBuying;
    private LocalDate targetDate;
    private String quirkyDescription;
}
