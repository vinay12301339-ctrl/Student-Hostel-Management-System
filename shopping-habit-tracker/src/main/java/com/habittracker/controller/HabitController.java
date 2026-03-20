package com.habittracker.controller;

import com.habittracker.dto.HabitInsightDTO;
import com.habittracker.model.Nudge;
import com.habittracker.service.HabitAnalysisService;
import com.habittracker.service.NudgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitAnalysisService habitAnalysisService;
    private final NudgeService nudgeService;

    @GetMapping("/insights")
    public ResponseEntity<HabitInsightDTO> getHabitInsights(@PathVariable Long userId) {
        return ResponseEntity.ok(habitAnalysisService.getHabitInsights(userId));
    }

    @GetMapping("/nudges")
    public ResponseEntity<List<Nudge>> getNudges(@PathVariable Long userId,
                                                  @RequestParam(defaultValue = "false") boolean unreadOnly) {
        List<Nudge> nudges = unreadOnly
                ? nudgeService.getUnreadNudges(userId)
                : nudgeService.getAllNudges(userId);
        return ResponseEntity.ok(nudges);
    }

    @GetMapping("/nudges/count")
    public ResponseEntity<Map<String, Long>> getUnreadNudgeCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("unreadCount", nudgeService.getUnreadCount(userId)));
    }

    @PatchMapping("/nudges/{nudgeId}/read")
    public ResponseEntity<Void> markNudgeAsRead(@PathVariable Long userId,
                                                 @PathVariable Long nudgeId) {
        nudgeService.markNudgeAsRead(userId, nudgeId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/nudges/read-all")
    public ResponseEntity<Void> markAllNudgesAsRead(@PathVariable Long userId) {
        nudgeService.markAllNudgesAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
