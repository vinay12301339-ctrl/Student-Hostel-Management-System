package com.habittracker.service;

import com.habittracker.dto.MoodRequest;
import com.habittracker.model.Mood;
import com.habittracker.model.Purchase;
import com.habittracker.model.User;
import com.habittracker.repository.MoodRepository;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MoodService {

    private final MoodRepository moodRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;

    @Transactional
    public Mood logMood(Long userId, MoodRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Mood mood = new Mood();
        mood.setUser(user);
        mood.setMoodType(request.getMoodType());
        mood.setEmoji(request.getEmoji() != null ? request.getEmoji() : getDefaultEmoji(request.getMoodType()));
        mood.setNote(request.getNote());
        mood.setIntensity(request.getIntensity());
        mood.setTrigger(request.getTrigger());
        mood.setRecordedAt(LocalDateTime.now());

        if (request.getPurchaseId() != null) {
            Purchase purchase = purchaseRepository.findById(request.getPurchaseId())
                    .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + request.getPurchaseId()));
            mood.setPurchase(purchase);
        }

        return moodRepository.save(mood);
    }

    @Transactional(readOnly = true)
    public List<Mood> getMoodHistory(Long userId) {
        return moodRepository.findByUserIdOrderByRecordedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getMoodFrequency(Long userId) {
        List<Object[]> rows = moodRepository.getMoodFrequency(userId);
        return rows.stream().collect(Collectors.toMap(
                r -> r[0].toString(),
                r -> ((Number) r[1]).longValue()
        ));
    }

    @Transactional(readOnly = true)
    public List<Mood> getMoodsForPurchase(Long purchaseId) {
        return moodRepository.findByPurchaseId(purchaseId);
    }

    private String getDefaultEmoji(Mood.MoodType type) {
        return switch (type) {
            case JOY -> "😄";
            case SADNESS -> "😢";
            case ANGER -> "😠";
            case FEAR -> "😨";
            case SURPRISE -> "😲";
            case DISGUST -> "🤢";
            case EXCITEMENT -> "🤩";
            case ANXIETY -> "😰";
            case BOREDOM -> "😐";
            case STRESS -> "😤";
            case CONTENTMENT -> "😌";
        };
    }
}
