package com.habittracker.service;

import com.habittracker.model.*;
import com.habittracker.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GamificationServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private NudgeService nudgeService;

    @InjectMocks
    private GamificationService gamificationService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("test@example.com");
        sampleUser.setTotalPoints(0);
    }

    @Test
    void getUserBadges_returnsList() {
        Badge badge = new Badge();
        badge.setId(1L);
        badge.setUser(sampleUser);
        badge.setName("Explorer \uD83D\uDDFA\uFE0F");
        badge.setType(Badge.BadgeType.EXPLORER);
        badge.setRarity(Badge.BadgeRarity.COMMON);

        when(badgeRepository.findByUserIdOrderByEarnedAtDesc(1L)).thenReturn(List.of(badge));

        List<Badge> badges = gamificationService.getUserBadges(1L);

        assertThat(badges).hasSize(1);
        assertThat(badges.get(0).getType()).isEqualTo(Badge.BadgeType.EXPLORER);
    }

    @Test
    void checkAndAwardGoalBadge_whenNoBadgeExists_awardsBadge() {
        when(badgeRepository.existsByUserIdAndType(1L, Badge.BadgeType.GOAL_CRUSHER)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(badgeRepository.save(any(Badge.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        Goal goal = new Goal();
        goal.setTitle("Test Goal");
        goal.setType(Goal.GoalType.SPENDING_LIMIT);

        gamificationService.checkAndAwardGoalBadge(1L, goal);

        verify(badgeRepository).save(any(Badge.class));
        assertThat(sampleUser.getTotalPoints()).isEqualTo(150);
    }

    @Test
    void checkAndAwardGoalBadge_whenBadgeAlreadyExists_doesNotAwardAgain() {
        when(badgeRepository.existsByUserIdAndType(1L, Badge.BadgeType.GOAL_CRUSHER)).thenReturn(true);

        Goal goal = new Goal();
        goal.setTitle("Test Goal");

        gamificationService.checkAndAwardGoalBadge(1L, goal);

        verify(badgeRepository, never()).save(any(Badge.class));
    }

    @Test
    void checkStreakBadges_sevenDayStreak_awardsRareBadge() {
        when(badgeRepository.existsByUserIdAndType(1L, Badge.BadgeType.STREAK_BREAKER)).thenReturn(false);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(badgeRepository.save(any(Badge.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        gamificationService.checkStreakBadges(1L, 7);

        verify(badgeRepository).save(any(Badge.class));
        verify(nudgeService).generateStreakNudge(1L, 7);
        assertThat(sampleUser.getTotalPoints()).isEqualTo(100);
    }

    @Test
    void processPurchaseAchievements_explorerBadge_awardedWhenFiveCategoriesReached() {
        Purchase purchase = new Purchase();
        purchase.setUser(sampleUser);
        purchase.setItemName("Item");
        purchase.setAmount(new BigDecimal("20.00"));
        purchase.setImpulseBuy(false);
        purchase.setPurchasedAt(LocalDateTime.now().withHour(14));

        List<Object[]> fiveCategories = List.of(
                new Object[]{"FOOD_DRINKS", BigDecimal.TEN, 2L},
                new Object[]{"CLOTHING", BigDecimal.TEN, 2L},
                new Object[]{"ELECTRONICS", BigDecimal.TEN, 2L},
                new Object[]{"BOOKS", BigDecimal.TEN, 2L},
                new Object[]{"HOME_DECOR", BigDecimal.TEN, 2L}
        );

        when(purchaseRepository.findByUserIdAndPurchasedAtBetween(anyLong(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(purchaseRepository.getTotalSpendingForPeriod(anyLong(), any(), any()))
                .thenReturn(new BigDecimal("50.00"));
        when(purchaseRepository.getCategorySpendingSummary(anyLong())).thenReturn(fiveCategories);
        when(badgeRepository.existsByUserIdAndType(anyLong(), any())).thenReturn(false);
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(sampleUser));
        when(badgeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any())).thenReturn(sampleUser);

        gamificationService.processPurchaseAchievements(1L, purchase);

        verify(badgeRepository, atLeastOnce()).save(any(Badge.class));
    }
}
