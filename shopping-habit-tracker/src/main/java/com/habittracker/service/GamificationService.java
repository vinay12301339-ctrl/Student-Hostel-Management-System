package com.habittracker.service;

import com.habittracker.model.*;
import com.habittracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * GamificationService: Awards badges and points for shopping milestones.
 * Gamifies responsible spending with streaks, challenges, and achievements.
 */
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final NudgeService nudgeService;

    @Transactional
    public void processPurchaseAchievements(Long userId, Purchase purchase) {
        checkImpulseSlayerBadge(userId, purchase);
        checkBudgetMasterBadge(userId, purchase);
        checkExplorerBadge(userId);
        checkNightOwlReformedBadge(userId, purchase);
    }

    @Transactional
    public void checkAndAwardGoalBadge(Long userId, Goal goal) {
        if (!badgeRepository.existsByUserIdAndType(userId, Badge.BadgeType.GOAL_CRUSHER)) {
            awardBadge(userId,
                    "Goal Crusher 🎯",
                    "Crushed your first shopping goal! The discipline is REAL!",
                    "🎯",
                    Badge.BadgeType.GOAL_CRUSHER,
                    Badge.BadgeRarity.EPIC,
                    150);
        }
    }

    @Transactional
    public void checkStreakBadges(Long userId, int streakDays) {
        if (streakDays == 7 && !badgeRepository.existsByUserIdAndType(userId, Badge.BadgeType.STREAK_BREAKER)) {
            awardBadge(userId,
                    "7-Day Streak Breaker 🔥",
                    "7 consecutive days of mindful shopping! You're unstoppable!",
                    "🔥",
                    Badge.BadgeType.STREAK_BREAKER,
                    Badge.BadgeRarity.RARE,
                    100);
            nudgeService.generateStreakNudge(userId, 7);
        } else if (streakDays == 30) {
            awardBadge(userId,
                    "Monthly Champion 👑",
                    "30 days of smart shopping! You've leveled up!",
                    "👑",
                    Badge.BadgeType.STREAK_BREAKER,
                    Badge.BadgeRarity.LEGENDARY,
                    500);
            nudgeService.generateStreakNudge(userId, 30);
        }
    }

    @Transactional(readOnly = true)
    public List<Badge> getUserBadges(Long userId) {
        return badgeRepository.findByUserIdOrderByEarnedAtDesc(userId);
    }

    private void checkImpulseSlayerBadge(Long userId, Purchase purchase) {
        if (!purchase.isImpulseBuy()) {
            List<Purchase> recent = purchaseRepository.findByUserIdAndPurchasedAtBetween(
                    userId,
                    LocalDateTime.now().minusDays(7),
                    LocalDateTime.now());

            boolean hasNoRecentImpulse = recent.stream().noneMatch(Purchase::isImpulseBuy);
            if (hasNoRecentImpulse && recent.size() >= 3 &&
                    !badgeRepository.existsByUserIdAndType(userId, Badge.BadgeType.IMPULSE_SLAYER)) {
                awardBadge(userId,
                        "Impulse Slayer ⚔️",
                        "7 days with zero impulse buys! Your willpower is legendary!",
                        "⚔️",
                        Badge.BadgeType.IMPULSE_SLAYER,
                        Badge.BadgeRarity.EPIC,
                        200);
            }
        }
    }

    private void checkBudgetMasterBadge(Long userId, Purchase purchase) {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthSpend = purchaseRepository.getTotalSpendingForPeriod(userId, monthStart, LocalDateTime.now());

        if (monthSpend != null && monthSpend.compareTo(new BigDecimal("50.00")) <= 0 &&
                !badgeRepository.existsByUserIdAndType(userId, Badge.BadgeType.BUDGET_MASTER)) {
            awardBadge(userId,
                    "Budget Master 💰",
                    "Under $50 for the month! The minimalist lifestyle suits you!",
                    "💰",
                    Badge.BadgeType.BUDGET_MASTER,
                    Badge.BadgeRarity.RARE,
                    150);
        }
    }

    private void checkExplorerBadge(Long userId) {
        List<Object[]> categories = purchaseRepository.getCategorySpendingSummary(userId);
        if (categories.size() >= 5 && !badgeRepository.existsByUserIdAndType(userId, Badge.BadgeType.EXPLORER)) {
            awardBadge(userId,
                    "Category Explorer 🗺️",
                    "Shopped in 5+ categories! You're a true shopping explorer!",
                    "🗺️",
                    Badge.BadgeType.EXPLORER,
                    Badge.BadgeRarity.COMMON,
                    50);
        }
    }

    private void checkNightOwlReformedBadge(Long userId, Purchase purchase) {
        int hour = purchase.getPurchasedAt().getHour();
        if (hour >= 9 && hour <= 18) {
            List<Purchase> recent = purchaseRepository.findByUserIdAndPurchasedAtBetween(
                    userId,
                    LocalDateTime.now().minusDays(14),
                    LocalDateTime.now());

            boolean allDaytime = recent.stream().allMatch(p -> {
                int h = p.getPurchasedAt().getHour();
                return h >= 9 && h <= 18;
            });

            if (allDaytime && recent.size() >= 5 &&
                    !badgeRepository.existsByUserIdAndType(userId, Badge.BadgeType.NIGHT_OWL_REFORMED)) {
                awardBadge(userId,
                        "Night Owl Reformed 🦉",
                        "2 weeks of daytime-only shopping! The 3AM cart sessions are OVER!",
                        "🦉",
                        Badge.BadgeType.NIGHT_OWL_REFORMED,
                        Badge.BadgeRarity.EPIC,
                        175);
            }
        }
    }

    private void awardBadge(Long userId, String name, String description, String emoji,
                            Badge.BadgeType type, Badge.BadgeRarity rarity, int points) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Badge badge = new Badge();
        badge.setUser(user);
        badge.setName(name);
        badge.setDescription(description);
        badge.setEmoji(emoji);
        badge.setType(type);
        badge.setRarity(rarity);
        badge.setPointsAwarded(points);
        badge.setEarnedAt(LocalDateTime.now());
        badgeRepository.save(badge);

        // Award points to user
        user.setTotalPoints(user.getTotalPoints() + points);
        userRepository.save(user);

        // Send achievement nudge
        nudgeService.generateAchievementNudge(userId, name, emoji, points);
    }
}
