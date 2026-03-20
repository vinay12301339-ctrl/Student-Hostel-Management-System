package com.habittracker.repository;

import com.habittracker.model.Nudge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NudgeRepository extends JpaRepository<Nudge, Long> {

    List<Nudge> findByUserIdAndIsReadFalseOrderByScheduledAtDesc(Long userId);

    List<Nudge> findByUserIdOrderByScheduledAtDesc(Long userId);

    List<Nudge> findByUserIdAndType(Long userId, Nudge.NudgeType type);

    long countByUserIdAndIsReadFalse(Long userId);
}
