package com.habittracker.controller;

import com.habittracker.dto.AnalyticsDashboardDTO;
import com.habittracker.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDashboardDTO> getDashboard(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getDashboard(userId));
    }
}
