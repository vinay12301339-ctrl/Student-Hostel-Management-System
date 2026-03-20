package com.habittracker.controller;

import com.habittracker.dto.GoalRequest;
import com.habittracker.model.Goal;
import com.habittracker.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<Goal> createGoal(@PathVariable Long userId,
                                            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.createGoal(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getAllGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getAllGoals(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Goal>> getActiveGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getActiveGoals(userId));
    }

    @GetMapping("/achieved")
    public ResponseEntity<List<Goal>> getAchievedGoals(@PathVariable Long userId) {
        return ResponseEntity.ok(goalService.getAchievedGoals(userId));
    }

    @PatchMapping("/{goalId}/achieve")
    public ResponseEntity<Goal> markGoalAchieved(@PathVariable Long userId,
                                                   @PathVariable Long goalId) {
        return ResponseEntity.ok(goalService.markGoalAchieved(userId, goalId));
    }

    @PostMapping("/check-progress")
    public ResponseEntity<Void> checkGoalProgress(@PathVariable Long userId) {
        goalService.checkGoalProgress(userId);
        return ResponseEntity.ok().build();
    }
}
