package com.habittracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "moods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id")
    private Purchase purchase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodType moodType;

    private String emoji;

    @Column(length = 500)
    private String note;

    @Min(1)
    @Max(10)
    private int intensity = 5;

    private String trigger;

    @Column(nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public enum MoodType {
        JOY, SADNESS, ANGER, FEAR, SURPRISE, DISGUST,
        EXCITEMENT, ANXIETY, BOREDOM, STRESS, CONTENTMENT
    }
}
