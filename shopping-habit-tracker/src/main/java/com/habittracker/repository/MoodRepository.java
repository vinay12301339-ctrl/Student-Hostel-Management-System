package com.habittracker.repository;

import com.habittracker.model.Mood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MoodRepository extends JpaRepository<Mood, Long> {

    List<Mood> findByUserIdOrderByRecordedAtDesc(Long userId);

    List<Mood> findByUserIdAndRecordedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT m.moodType, COUNT(m) FROM Mood m WHERE m.user.id = :userId GROUP BY m.moodType ORDER BY COUNT(m) DESC")
    List<Object[]> getMoodFrequency(@Param("userId") Long userId);

    @Query("SELECT m.moodType, SUM(p.amount) FROM Mood m JOIN m.purchase p WHERE m.user.id = :userId AND p IS NOT NULL GROUP BY m.moodType")
    List<Object[]> getSpendingByMoodType(@Param("userId") Long userId);

    List<Mood> findByPurchaseId(Long purchaseId);
}
