package com.habittracker.controller;

import com.habittracker.model.Badge;
import com.habittracker.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final GamificationService gamificationService;

    @GetMapping
    public ResponseEntity<List<Badge>> getUserBadges(@PathVariable Long userId) {
        return ResponseEntity.ok(gamificationService.getUserBadges(userId));
    }
}
