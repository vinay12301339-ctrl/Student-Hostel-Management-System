package com.habittracker.dto;

import com.habittracker.model.Habit;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitInsightDTO {

    private List<DetectedHabitDTO> detectedHabits;
    private List<LoopingHabitDTO> loopingHabits;
    private List<RadarDataPointDTO> habitRadarData;
    private String shopperPersonality;
    private int totalActiveStreaks;
    private String personalityDescription;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetectedHabitDTO {
        private String habitName;
        private Habit.HabitType type;
        private String description;
        private int occurrenceCount;
        private String emoji;
        private boolean isLooping;
        private String breakTheLoopChallenge;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoopingHabitDTO {
        private String habitName;
        private int loopCount;
        private String triggerPattern;
        private String challengeTitle;
        private String challengeDescription;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarDataPointDTO {
        private String label;
        private double value;
        private String category;
    }
}
