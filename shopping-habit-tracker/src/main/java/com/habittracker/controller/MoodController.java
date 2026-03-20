package com.habittracker.controller;

import com.habittracker.dto.MoodRequest;
import com.habittracker.model.Mood;
import com.habittracker.service.MoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/moods")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;

    @PostMapping
    public ResponseEntity<Mood> logMood(@PathVariable Long userId,
                                         @Valid @RequestBody MoodRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moodService.logMood(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<Mood>> getMoodHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(moodService.getMoodHistory(userId));
    }

    @GetMapping("/frequency")
    public ResponseEntity<Map<String, Long>> getMoodFrequency(@PathVariable Long userId) {
        return ResponseEntity.ok(moodService.getMoodFrequency(userId));
    }

    @GetMapping("/purchase/{purchaseId}")
    public ResponseEntity<List<Mood>> getMoodsForPurchase(@PathVariable Long userId,
                                                           @PathVariable Long purchaseId) {
        return ResponseEntity.ok(moodService.getMoodsForPurchase(purchaseId));
    }
}
