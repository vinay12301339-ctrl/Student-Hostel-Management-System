package com.habittracker.service;

import com.habittracker.dto.GoalRequest;
import com.habittracker.model.Goal;
import com.habittracker.model.User;
import com.habittracker.repository.GoalRepository;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final GamificationService gamificationService;
    private final NudgeService nudgeService;

    @Transactional
    public Goal createGoal(Long userId, GoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Goal goal = new Goal();
        goal.setUser(user);
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setType(request.getType());
        goal.setTargetCategory(request.getTargetCategory());
        goal.setSpendingLimit(request.getSpendingLimit());
        goal.setTargetDaysWithoutBuying(request.getTargetDaysWithoutBuying());
        goal.setTargetDate(request.getTargetDate());
        goal.setQuirkyDescription(request.getQuirkyDescription());
        goal.setStartDate(LocalDate.now());

        return goalRepository.save(goal);
    }

    @Transactional(readOnly = true)
    public List<Goal> getActiveGoals(Long userId) {
        return goalRepository.findByUserIdAndIsAchievedFalseAndIsActiveTrue(userId);
    }

    @Transactional(readOnly = true)
    public List<Goal> getAllGoals(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Goal> getAchievedGoals(Long userId) {
        return goalRepository.findByUserIdAndIsAchievedTrue(userId);
    }

    @Transactional
    public Goal markGoalAchieved(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found: " + goalId));
        if (!goal.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Goal does not belong to user");
        }
        goal.setAchieved(true);
        goal.setAchievedDate(LocalDate.now());

        Goal saved = goalRepository.save(goal);
        gamificationService.checkAndAwardGoalBadge(userId, saved);
        return saved;
    }

    @Transactional
    public void checkGoalProgress(Long userId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndIsAchievedFalseAndIsActiveTrue(userId);

        for (Goal goal : activeGoals) {
            if (goal.getType() == Goal.GoalType.SPENDING_LIMIT && goal.getSpendingLimit() != null) {
                checkSpendingLimitGoal(userId, goal);
            } else if (goal.getType() == Goal.GoalType.NO_BUYING_STREAK) {
                checkNoBuyingStreakGoal(userId, goal);
            }
        }
    }

    private void checkSpendingLimitGoal(Long userId, Goal goal) {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        BigDecimal spent = purchaseRepository.getTotalSpendingForPeriod(userId, monthStart, LocalDateTime.now());
        if (spent == null) spent = BigDecimal.ZERO;

        if (goal.getTargetCategory() != null) {
            // Category-specific goal — check deferred to future enhancement
        } else if (spent.compareTo(goal.getSpendingLimit()) > 0) {
            nudgeService.generateHabitLoopNudge(userId, goal.getTitle(), spent.intValue());
        }
    }

    private void checkNoBuyingStreakGoal(Long userId, Goal goal) {
        if (goal.getDaysWithoutBuying() >= goal.getTargetDaysWithoutBuying()) {
            goal.setAchieved(true);
            goal.setAchievedDate(LocalDate.now());
            goalRepository.save(goal);
            gamificationService.checkAndAwardGoalBadge(userId, goal);
        }
    }
}
