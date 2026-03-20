package com.habittracker.service;

import com.habittracker.model.*;
import com.habittracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * NudgeService: AI-powered rule-based nudge engine.
 * Generates playful notifications based on shopping behaviour patterns.
 */
@Service
@RequiredArgsConstructor
public class NudgeService {

    private final NudgeRepository nudgeRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;

    private static final BigDecimal LARGE_PURCHASE_THRESHOLD = new BigDecimal("100.00");
    private static final int IMPULSE_COUNT_THRESHOLD = 3;
    private static final int LATE_NIGHT_HOUR_START = 22;
    private static final int LATE_NIGHT_HOUR_END = 5;

    @Transactional
    public void generatePostPurchaseNudges(Long userId, Purchase purchase) {
        LocalDateTime now = LocalDateTime.now();
        int hour = purchase.getPurchasedAt().getHour();

        // Nudge for late-night purchases
        if (hour >= LATE_NIGHT_HOUR_START || hour <= LATE_NIGHT_HOUR_END) {
            createNudge(userId,
                    "🌙 Night owl alert! Shopping at " + hour + ":00? Your wallet needs sleep too! 😴",
                    Nudge.NudgeType.IMPULSE_GUARD,
                    Nudge.NudgeTrigger.PURCHASE_MADE,
                    "🌙");
        }

        // Nudge for impulse buys
        if (purchase.isImpulseBuy()) {
            List<Purchase> recentImpulse = purchaseRepository.findByUserIdAndIsImpulseBuyTrue(userId);
            if (recentImpulse.size() >= IMPULSE_COUNT_THRESHOLD) {
                createNudge(userId,
                        "🚨 Impulse buying spree detected! You've had " + recentImpulse.size() +
                                " impulse buys. Time to pause and reflect? 🤔",
                        Nudge.NudgeType.HABIT_LOOP_WARNING,
                        Nudge.NudgeTrigger.PURCHASE_MADE,
                        "🚨");
            } else {
                createNudge(userId,
                        "💭 Just bought '" + purchase.getItemName() + "' on impulse! " +
                                "Was it worth it? Rate your satisfaction later! ⭐",
                        Nudge.NudgeType.IMPULSE_GUARD,
                        Nudge.NudgeTrigger.PURCHASE_MADE,
                        "💭");
            }
        }

        // Nudge for large purchases
        if (purchase.getAmount().compareTo(LARGE_PURCHASE_THRESHOLD) > 0) {
            createNudge(userId,
                    "💸 Big spender alert! " + purchase.getCurrency() + " " + purchase.getAmount() +
                            " on '" + purchase.getItemName() + "'. Hope it sparks joy! ✨",
                    Nudge.NudgeType.SPENDING_ALERT,
                    Nudge.NudgeTrigger.PURCHASE_MADE,
                    "💸");
        }

        // Mood-based nudge
        if (purchase.getMoodAtPurchase() == Purchase.MoodAtPurchase.STRESSED ||
                purchase.getMoodAtPurchase() == Purchase.MoodAtPurchase.SAD ||
                purchase.getMoodAtPurchase() == Purchase.MoodAtPurchase.ANXIOUS) {
            createNudge(userId,
                    "💙 Shopping while " + purchase.getMoodAtPurchase().name().toLowerCase() + "? " +
                            "Retail therapy is valid, but remember: you are enough! 🌟",
                    Nudge.NudgeType.MOOD_CHECK,
                    Nudge.NudgeTrigger.MOOD_TRIGGER,
                    "💙");
        }
    }

    @Transactional
    public void generateHabitLoopNudge(Long userId, String habitName, int loopCount) {
        createNudge(userId,
                "🔄 Habit loop detected: '" + habitName + "' has repeated " + loopCount + " times! " +
                        "Challenge: Go 3 days without this pattern! 🎯",
                Nudge.NudgeType.HABIT_LOOP_WARNING,
                Nudge.NudgeTrigger.HABIT_DETECTED,
                "🔄");
    }

    @Transactional
    public void generateAchievementNudge(Long userId, String badgeName, String emoji, int points) {
        createNudge(userId,
                emoji + " New badge unlocked: " + badgeName + "! +" + points + " points earned! 🎉",
                Nudge.NudgeType.ACHIEVEMENT_UNLOCK,
                Nudge.NudgeTrigger.STREAK_MILESTONE,
                emoji);
    }

    @Transactional
    public void generateStreakNudge(Long userId, int streakDays) {
        String message;
        if (streakDays == 7) {
            message = "🔥 7-day streak! A whole week of mindful shopping! You're on fire! 🔥";
        } else if (streakDays == 30) {
            message = "🏆 30-day streak! One month of smart shopping habits! Legendary! 👑";
        } else {
            message = "⭐ " + streakDays + "-day streak! Keep up the amazing work! You've got this! 💪";
        }
        createNudge(userId, message, Nudge.NudgeType.STREAK_REMINDER,
                Nudge.NudgeTrigger.STREAK_MILESTONE, "⭐");
    }

    @Transactional(readOnly = true)
    public List<Nudge> getUnreadNudges(Long userId) {
        return nudgeRepository.findByUserIdAndIsReadFalseOrderByScheduledAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<Nudge> getAllNudges(Long userId) {
        return nudgeRepository.findByUserIdOrderByScheduledAtDesc(userId);
    }

    @Transactional
    public void markNudgeAsRead(Long userId, Long nudgeId) {
        Nudge nudge = nudgeRepository.findById(nudgeId)
                .orElseThrow(() -> new IllegalArgumentException("Nudge not found: " + nudgeId));
        if (!nudge.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Nudge does not belong to user");
        }
        nudge.setRead(true);
        nudge.setReadAt(LocalDateTime.now());
        nudgeRepository.save(nudge);
    }

    @Transactional
    public void markAllNudgesAsRead(Long userId) {
        List<Nudge> unread = nudgeRepository.findByUserIdAndIsReadFalseOrderByScheduledAtDesc(userId);
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(now);
        });
        nudgeRepository.saveAll(unread);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return nudgeRepository.countByUserIdAndIsReadFalse(userId);
    }

    private void createNudge(Long userId, String message, Nudge.NudgeType type,
                             Nudge.NudgeTrigger trigger, String emoji) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Nudge nudge = new Nudge();
        nudge.setUser(user);
        nudge.setMessage(message);
        nudge.setType(type);
        nudge.setTrigger(trigger);
        nudge.setEmoji(emoji);
        nudge.setScheduledAt(LocalDateTime.now());
        nudgeRepository.save(nudge);
    }
}
