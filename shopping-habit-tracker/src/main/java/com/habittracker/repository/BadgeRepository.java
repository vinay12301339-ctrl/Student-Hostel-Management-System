package com.habittracker.repository;

import com.habittracker.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findByUserIdOrderByEarnedAtDesc(Long userId);

    boolean existsByUserIdAndType(Long userId, Badge.BadgeType type);

    List<Badge> findByUserIdAndRarity(Long userId, Badge.BadgeRarity rarity);
}
