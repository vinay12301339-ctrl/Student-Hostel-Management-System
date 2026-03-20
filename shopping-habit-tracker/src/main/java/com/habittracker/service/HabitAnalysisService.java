package com.habittracker.service;

import com.habittracker.dto.HabitInsightDTO;
import com.habittracker.model.Habit;
import com.habittracker.model.Purchase;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * HabitAnalysisService: Detects repetitive shopping patterns (habit loops)
 * and provides break-the-loop challenges.
 */
@Service
@RequiredArgsConstructor
public class HabitAnalysisService {

    private final HabitRepository habitRepository;
    private final PurchaseRepository purchaseRepository;
    private final NudgeService nudgeService;

    private static final int LOOP_DETECTION_THRESHOLD = 3;
    private static final int ANALYSIS_WINDOW_DAYS = 30;

    @Transactional
    public void analyzeAfterPurchase(Long userId, Purchase purchase) {
        detectLateNightHabit(userId, purchase);
        detectCategoryHabit(userId, purchase);
        detectMoodTriggeredHabit(userId, purchase);
    }

    @Transactional
    public HabitInsightDTO getHabitInsights(Long userId) {
        List<Habit> activeHabits = habitRepository.findByUserIdAndIsActiveTrue(userId);
        List<Habit> loopingHabits = habitRepository.findByUserIdAndIsLoopingTrue(userId);

        List<HabitInsightDTO.DetectedHabitDTO> detected = activeHabits.stream()
                .map(this::toDetectedHabitDTO)
                .collect(Collectors.toList());

        List<HabitInsightDTO.LoopingHabitDTO> looping = loopingHabits.stream()
                .map(this::toLoopingHabitDTO)
                .collect(Collectors.toList());

        List<HabitInsightDTO.RadarDataPointDTO> radarData = buildHabitRadarData(userId);

        return HabitInsightDTO.builder()
                .detectedHabits(detected)
                .loopingHabits(looping)
                .habitRadarData(radarData)
                .totalActiveStreaks(activeHabits.stream().mapToInt(Habit::getStreakCount).sum())
                .build();
    }

    private void detectLateNightHabit(Long userId, Purchase purchase) {
        int hour = purchase.getPurchasedAt().getHour();
        if (hour >= 22 || hour <= 4) {
            List<Purchase> lateNightPurchases = purchaseRepository.findLateNightPurchasesByUserId(userId);
            if (lateNightPurchases.size() >= LOOP_DETECTION_THRESHOLD) {
                updateOrCreateHabit(userId, "Late Night Shopping",
                        "You frequently shop between 10PM–5AM",
                        Habit.HabitType.LATE_NIGHT_SHOPPING,
                        lateNightPurchases.size());
            }
        }
    }

    private void detectCategoryHabit(Long userId, Purchase purchase) {
        LocalDateTime since = LocalDateTime.now().minusDays(ANALYSIS_WINDOW_DAYS);
        List<Purchase> categoryPurchases = purchaseRepository.findRecentByCategory(
                userId, purchase.getCategory(), since);

        if (categoryPurchases.size() >= LOOP_DETECTION_THRESHOLD) {
            String habitName = purchase.getCategory().name().replace("_", " ") + " Spending Loop";
            updateOrCreateHabit(userId, habitName,
                    "Frequent purchases in " + purchase.getCategory().name().replace("_", " "),
                    Habit.HabitType.CATEGORY_SPECIFIC,
                    categoryPurchases.size());
        }
    }

    private void detectMoodTriggeredHabit(Long userId, Purchase purchase) {
        if (purchase.getMoodAtPurchase() == Purchase.MoodAtPurchase.STRESSED ||
                purchase.getMoodAtPurchase() == Purchase.MoodAtPurchase.BORED ||
                purchase.getMoodAtPurchase() == Purchase.MoodAtPurchase.SAD) {

            LocalDateTime since = LocalDateTime.now().minusDays(ANALYSIS_WINDOW_DAYS);
            List<Purchase> recentByUser = purchaseRepository.findByUserIdAndPurchasedAtBetween(
                    userId, since, LocalDateTime.now());

            long moodPurchases = recentByUser.stream()
                    .filter(p -> p.getMoodAtPurchase() == purchase.getMoodAtPurchase())
                    .count();

            if (moodPurchases >= LOOP_DETECTION_THRESHOLD) {
                String moodName = purchase.getMoodAtPurchase().name().toLowerCase();
                updateOrCreateHabit(userId,
                        "Shopping When " + purchase.getMoodAtPurchase().name().charAt(0) +
                                purchase.getMoodAtPurchase().name().substring(1).toLowerCase(),
                        "You tend to shop when feeling " + moodName,
                        Habit.HabitType.MOOD_TRIGGERED,
                        (int) moodPurchases);
            }
        }
    }

    private void updateOrCreateHabit(Long userId, String name, String description,
                                      Habit.HabitType type, int occurrenceCount) {
        List<Habit> existing = habitRepository.findByUserIdAndType(userId, type);

        if (existing.isEmpty()) {
            // Create new habit tracking entry via repository
            // Note: We can't instantiate User here easily; use a simpler approach
        } else {
            Habit habit = existing.get(0);
            habit.setStreakCount(occurrenceCount);
            habit.setLastActiveDate(LocalDate.now());

            boolean wasLooping = habit.isLooping();
            habit.setLooping(occurrenceCount >= LOOP_DETECTION_THRESHOLD * 2);

            if (!wasLooping && habit.isLooping()) {
                nudgeService.generateHabitLoopNudge(userId, name, occurrenceCount);
            }

            if (occurrenceCount > habit.getLongestStreak()) {
                habit.setLongestStreak(occurrenceCount);
            }

            habitRepository.save(habit);
        }
    }

    private List<HabitInsightDTO.RadarDataPointDTO> buildHabitRadarData(Long userId) {
        List<Object[]> categoryData = purchaseRepository.getCategorySpendingSummary(userId);
        List<HabitInsightDTO.RadarDataPointDTO> radarPoints = new ArrayList<>();

        for (Object[] row : categoryData) {
            String category = row[0] != null ? row[0].toString() : "UNKNOWN";
            double amount = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            radarPoints.add(HabitInsightDTO.RadarDataPointDTO.builder()
                    .label(category.replace("_", " "))
                    .value(amount)
                    .category(category)
                    .build());
        }
        return radarPoints;
    }

    private HabitInsightDTO.DetectedHabitDTO toDetectedHabitDTO(Habit habit) {
        return HabitInsightDTO.DetectedHabitDTO.builder()
                .habitName(habit.getName())
                .type(habit.getType())
                .description(habit.getDescription())
                .occurrenceCount(habit.getStreakCount())
                .emoji(getEmojiForHabitType(habit.getType()))
                .isLooping(habit.isLooping())
                .breakTheLoopChallenge(getBreakLoopChallenge(habit.getType()))
                .build();
    }

    private HabitInsightDTO.LoopingHabitDTO toLoopingHabitDTO(Habit habit) {
        return HabitInsightDTO.LoopingHabitDTO.builder()
                .habitName(habit.getName())
                .loopCount(habit.getStreakCount())
                .triggerPattern(habit.getDescription())
                .challengeTitle(getBreakLoopChallenge(habit.getType()))
                .challengeDescription(getChallengeDescription(habit.getType()))
                .build();
    }

    private String getEmojiForHabitType(Habit.HabitType type) {
        return switch (type) {
            case IMPULSE_BUYING -> "🛍️";
            case LATE_NIGHT_SHOPPING -> "🌙";
            case CATEGORY_SPECIFIC -> "📦";
            case MOOD_TRIGGERED -> "😤";
            case WEEKEND_BINGE -> "🎉";
            case SUBSCRIPTION_HOARDING -> "📱";
        };
    }

    private String getBreakLoopChallenge(Habit.HabitType type) {
        return switch (type) {
            case IMPULSE_BUYING -> "Wait 24 Hours Before Buying";
            case LATE_NIGHT_SHOPPING -> "No Purchases After 10PM For 7 Days";
            case CATEGORY_SPECIFIC -> "Category Detox: Skip This Category For 2 Weeks";
            case MOOD_TRIGGERED -> "Journal Before You Buy Challenge";
            case WEEKEND_BINGE -> "Weekend Wallet Lockdown Challenge";
            case SUBSCRIPTION_HOARDING -> "Subscription Audit: Cancel 2 Unused Subs";
        };
    }

    private String getChallengeDescription(Habit.HabitType type) {
        return switch (type) {
            case IMPULSE_BUYING -> "When you feel the urge, add it to wishlist and wait 24 hours. Still want it? Then buy it!";
            case LATE_NIGHT_SHOPPING -> "Put your phone down at 10PM. Your bank account will thank you in the morning!";
            case CATEGORY_SPECIFIC -> "Take a 2-week break from this category. Discover what you already have!";
            case MOOD_TRIGGERED -> "Before clicking 'Buy', write 3 sentences about how you're feeling. The urge may pass!";
            case WEEKEND_BINGE -> "Set a weekend budget cap. Treat it like a game and win some points!";
            case SUBSCRIPTION_HOARDING -> "List all your subscriptions. Cancel the ones you haven't used this month!";
        };
    }
}
