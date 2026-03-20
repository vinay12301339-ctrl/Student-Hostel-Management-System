package com.habittracker.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDashboardDTO {

    private BigDecimal totalSpentThisMonth;
    private BigDecimal totalSpentLastMonth;
    private BigDecimal averagePurchaseAmount;
    private long totalPurchasesThisMonth;
    private long impulsePurchasesCount;
    private double impulsePurchasePercentage;

    private List<CategorySpendingDTO> spendingByCategory;
    private List<ShopVisitDTO> mostFrequentedShops;
    private List<MoodSpendingDTO> spendingByMood;
    private List<HourlyActivityDTO> purchasesByHour;
    private List<ColorTrendDTO> topColorsBought;
    private List<MonthlyTrendDTO> monthlyTrends;

    private HabitInsightDTO habitInsights;
    private WishlistSummaryDTO wishlistSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySpendingDTO {
        private String category;
        private BigDecimal totalAmount;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShopVisitDTO {
        private String shopName;
        private long visitCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoodSpendingDTO {
        private String mood;
        private BigDecimal totalAmount;
        private String emoji;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyActivityDTO {
        private int hour;
        private long purchaseCount;
        private boolean isPeakHour;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ColorTrendDTO {
        private String color;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendDTO {
        private String month;
        private BigDecimal amount;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WishlistSummaryDTO {
        private long pendingItems;
        private long purchasedItems;
        private long skippedItems;
        private double fulfillmentRate;
        private String impulseSurpriseMessage;
    }
}
