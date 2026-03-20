package com.habittracker.service;

import com.habittracker.dto.AnalyticsDashboardDTO;
import com.habittracker.dto.HabitInsightDTO;
import com.habittracker.model.WishlistItem;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * AnalyticsService: Powers the fun dashboards with spending insights,
 * mood patterns, habit radars, and impulse surprise reports.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PurchaseRepository purchaseRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final HabitAnalysisService habitAnalysisService;

    @Transactional(readOnly = true)
    public AnalyticsDashboardDTO getDashboard(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime lastMonthStart = monthStart.minusMonths(1);
        LocalDateTime lastMonthEnd = monthStart.minusSeconds(1);

        BigDecimal totalThisMonth = purchaseRepository.getTotalSpendingForPeriod(userId, monthStart, now);
        BigDecimal totalLastMonth = purchaseRepository.getTotalSpendingForPeriod(userId, lastMonthStart, lastMonthEnd);

        totalThisMonth = totalThisMonth != null ? totalThisMonth : BigDecimal.ZERO;
        totalLastMonth = totalLastMonth != null ? totalLastMonth : BigDecimal.ZERO;

        List<AnalyticsDashboardDTO.CategorySpendingDTO> categorySpending = buildCategorySpending(userId, totalThisMonth);
        List<AnalyticsDashboardDTO.ShopVisitDTO> topShops = buildTopShops(userId);
        List<AnalyticsDashboardDTO.MoodSpendingDTO> moodSpending = buildMoodSpending(userId);
        List<AnalyticsDashboardDTO.HourlyActivityDTO> hourlyActivity = buildHourlyActivity(userId);
        List<AnalyticsDashboardDTO.ColorTrendDTO> colorTrends = buildColorTrends(userId);
        List<AnalyticsDashboardDTO.MonthlyTrendDTO> monthlyTrends = buildMonthlyTrends(userId, now);

        long impulsePurchases = purchaseRepository.findByUserIdAndIsImpulseBuyTrue(userId).size();
        long totalThisMonthCount = purchaseRepository.findByUserIdAndPurchasedAtBetween(
                userId, monthStart, now).size();

        double impulsePercentage = totalThisMonthCount > 0
                ? Math.round((impulsePurchases * 100.0 / totalThisMonthCount) * 10.0) / 10.0
                : 0.0;

        BigDecimal avgPurchase = totalThisMonthCount > 0
                ? totalThisMonth.divide(BigDecimal.valueOf(totalThisMonthCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        HabitInsightDTO habitInsights = habitAnalysisService.getHabitInsights(userId);
        AnalyticsDashboardDTO.WishlistSummaryDTO wishlistSummary = buildWishlistSummary(userId);

        return AnalyticsDashboardDTO.builder()
                .totalSpentThisMonth(totalThisMonth)
                .totalSpentLastMonth(totalLastMonth)
                .averagePurchaseAmount(avgPurchase)
                .totalPurchasesThisMonth(totalThisMonthCount)
                .impulsePurchasesCount(impulsePurchases)
                .impulsePurchasePercentage(impulsePercentage)
                .spendingByCategory(categorySpending)
                .mostFrequentedShops(topShops)
                .spendingByMood(moodSpending)
                .purchasesByHour(hourlyActivity)
                .topColorsBought(colorTrends)
                .monthlyTrends(monthlyTrends)
                .habitInsights(habitInsights)
                .wishlistSummary(wishlistSummary)
                .build();
    }

    private List<AnalyticsDashboardDTO.CategorySpendingDTO> buildCategorySpending(Long userId, BigDecimal total) {
        List<Object[]> rows = purchaseRepository.getCategorySpendingSummary(userId);
        List<AnalyticsDashboardDTO.CategorySpendingDTO> result = new ArrayList<>();

        for (Object[] row : rows) {
            String category = row[0] != null ? row[0].toString() : "UNKNOWN";
            BigDecimal amount = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            double pct = total.compareTo(BigDecimal.ZERO) > 0
                    ? amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;

            result.add(AnalyticsDashboardDTO.CategorySpendingDTO.builder()
                    .category(category.replace("_", " "))
                    .totalAmount(amount)
                    .count(count)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }
        return result;
    }

    private List<AnalyticsDashboardDTO.ShopVisitDTO> buildTopShops(Long userId) {
        List<Object[]> rows = purchaseRepository.getMostFrequentedShops(userId);
        List<AnalyticsDashboardDTO.ShopVisitDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(AnalyticsDashboardDTO.ShopVisitDTO.builder()
                    .shopName((String) row[0])
                    .visitCount(((Number) row[1]).longValue())
                    .build());
        }
        return result;
    }

    private List<AnalyticsDashboardDTO.MoodSpendingDTO> buildMoodSpending(Long userId) {
        List<Object[]> rows = purchaseRepository.getSpendingByMood(userId);
        List<AnalyticsDashboardDTO.MoodSpendingDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            String mood = row[0] != null ? row[0].toString() : "UNKNOWN";
            BigDecimal amount = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            result.add(AnalyticsDashboardDTO.MoodSpendingDTO.builder()
                    .mood(mood)
                    .totalAmount(amount)
                    .emoji(getMoodEmoji(mood))
                    .build());
        }
        return result;
    }

    private List<AnalyticsDashboardDTO.HourlyActivityDTO> buildHourlyActivity(Long userId) {
        List<Object[]> rows = purchaseRepository.getPurchasesByHourOfDay(userId);
        List<AnalyticsDashboardDTO.HourlyActivityDTO> result = new ArrayList<>();
        long maxCount = rows.stream().mapToLong(r -> ((Number) r[1]).longValue()).max().orElse(1L);

        for (Object[] row : rows) {
            int hour = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            result.add(AnalyticsDashboardDTO.HourlyActivityDTO.builder()
                    .hour(hour)
                    .purchaseCount(count)
                    .isPeakHour(count == maxCount)
                    .build());
        }
        return result;
    }

    private List<AnalyticsDashboardDTO.ColorTrendDTO> buildColorTrends(Long userId) {
        List<Object[]> rows = purchaseRepository.getTopColorsBought(userId);
        List<AnalyticsDashboardDTO.ColorTrendDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(AnalyticsDashboardDTO.ColorTrendDTO.builder()
                    .color((String) row[0])
                    .count(((Number) row[1]).longValue())
                    .build());
        }
        return result;
    }

    private List<AnalyticsDashboardDTO.MonthlyTrendDTO> buildMonthlyTrends(Long userId, LocalDateTime now) {
        List<AnalyticsDashboardDTO.MonthlyTrendDTO> trends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1)
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime end = start.plusMonths(1).minusSeconds(1);
            BigDecimal amount = purchaseRepository.getTotalSpendingForPeriod(userId, start, end);
            long count = purchaseRepository.findByUserIdAndPurchasedAtBetween(userId, start, end).size();

            String monthLabel = start.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                    + " " + start.getYear();
            trends.add(AnalyticsDashboardDTO.MonthlyTrendDTO.builder()
                    .month(monthLabel)
                    .amount(amount != null ? amount : BigDecimal.ZERO)
                    .count(count)
                    .build());
        }
        return trends;
    }

    private AnalyticsDashboardDTO.WishlistSummaryDTO buildWishlistSummary(Long userId) {
        long pending = wishlistItemRepository.countByUserIdAndStatus(userId, WishlistItem.WishlistStatus.PENDING);
        long purchased = wishlistItemRepository.countByUserIdAndStatus(userId, WishlistItem.WishlistStatus.PURCHASED);
        long skipped = wishlistItemRepository.countByUserIdAndStatus(userId, WishlistItem.WishlistStatus.SKIPPED);
        long total = pending + purchased + skipped;

        double fulfillmentRate = total > 0
                ? Math.round((purchased * 100.0 / total) * 10.0) / 10.0
                : 0.0;

        long impulse = purchaseRepository.findByUserIdAndIsImpulseBuyTrue(userId).size();
        String surpriseMsg = buildImpulseSurpriseMessage(impulse, purchased, total);

        return AnalyticsDashboardDTO.WishlistSummaryDTO.builder()
                .pendingItems(pending)
                .purchasedItems(purchased)
                .skippedItems(skipped)
                .fulfillmentRate(fulfillmentRate)
                .impulseSurpriseMessage(surpriseMsg)
                .build();
    }

    private String buildImpulseSurpriseMessage(long impulseCount, long wishlistPurchased, long total) {
        if (impulseCount == 0 && wishlistPurchased > 0) {
            return "🎉 Impressive! 100% of your purchases this month were planned. You're a shopping legend!";
        } else if (impulseCount > wishlistPurchased) {
            return "😅 Impulse Surprise! You bought more unplanned items (" + impulseCount +
                    ") than wishlist items (" + wishlistPurchased + "). Oops, but hey, YOLO! 🎲";
        } else if (impulseCount > 0) {
            return "🛍️ Not bad! " + impulseCount + " impulse buys vs " + wishlistPurchased +
                    " planned buys. You're mostly a planner with a fun wild side! 😄";
        } else {
            return "📋 Keep building your wishlist to track planned vs impulse purchases!";
        }
    }

    private String getMoodEmoji(String mood) {
        return switch (mood.toUpperCase()) {
            case "HAPPY" -> "😊";
            case "SAD" -> "😢";
            case "STRESSED" -> "😤";
            case "BORED" -> "😐";
            case "EXCITED" -> "🤩";
            case "ANXIOUS" -> "😰";
            case "CONTENT" -> "😌";
            case "ANGRY" -> "😠";
            case "TIRED" -> "😴";
            default -> "😶";
        };
    }
}
