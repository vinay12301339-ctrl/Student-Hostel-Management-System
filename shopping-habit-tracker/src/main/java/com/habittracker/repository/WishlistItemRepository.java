package com.habittracker.repository;

import com.habittracker.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserIdAndStatus(Long userId, WishlistItem.WishlistStatus status);

    List<WishlistItem> findByUserIdOrderByPriorityAsc(Long userId);

    List<WishlistItem> findByUserIdAndCategoryAndStatus(Long userId,
            com.habittracker.model.Purchase.Category category,
            WishlistItem.WishlistStatus status);

    long countByUserIdAndStatus(Long userId, WishlistItem.WishlistStatus status);
}
