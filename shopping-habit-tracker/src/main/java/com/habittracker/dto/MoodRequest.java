package com.habittracker.dto;

import com.habittracker.model.Mood;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoodRequest {

    @NotNull
    private Mood.MoodType moodType;

    private String emoji;
    private String note;

    @Min(1)
    @Max(10)
    private int intensity = 5;

    private String trigger;
    private Long purchaseId;
}
