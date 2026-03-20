package com.habittracker.repository;

import com.habittracker.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUserIdAndIsActiveTrue(Long userId);

    List<Habit> findByUserId(Long userId);

    List<Habit> findByUserIdAndIsLoopingTrue(Long userId);

    @Query("SELECT h FROM Habit h WHERE h.user.id = :userId AND h.type = :type")
    List<Habit> findByUserIdAndType(@Param("userId") Long userId, @Param("type") Habit.HabitType type);

    boolean existsByUserIdAndTypeAndIsActiveTrue(Long userId, Habit.HabitType type);
}
