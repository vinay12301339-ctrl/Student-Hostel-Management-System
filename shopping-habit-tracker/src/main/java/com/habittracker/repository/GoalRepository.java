package com.habittracker.repository;

import com.habittracker.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserId(Long userId);

    List<Goal> findByUserIdAndIsActiveTrue(Long userId);

    List<Goal> findByUserIdAndIsAchievedFalseAndIsActiveTrue(Long userId);

    List<Goal> findByUserIdAndIsAchievedTrue(Long userId);

    List<Goal> findByUserIdAndTargetDateBefore(Long userId, LocalDate date);
}
