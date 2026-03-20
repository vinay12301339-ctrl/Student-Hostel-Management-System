package com.habittracker.repository;

import com.habittracker.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByUserIdOrderByPurchasedAtDesc(Long userId);

    List<Purchase> findByUserIdAndCategory(Long userId, Purchase.Category category);

    List<Purchase> findByUserIdAndPurchasedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<Purchase> findByUserIdAndIsImpulseBuyTrue(Long userId);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND (HOUR(p.purchasedAt) BETWEEN 22 AND 23 OR HOUR(p.purchasedAt) BETWEEN 0 AND 5)")
    List<Purchase> findLateNightPurchasesByUserId(@Param("userId") Long userId);

    @Query("SELECT p.category, SUM(p.amount), COUNT(p) FROM Purchase p WHERE p.user.id = :userId GROUP BY p.category")
    List<Object[]> getCategorySpendingSummary(@Param("userId") Long userId);

    @Query("SELECT p.shopName, COUNT(p) as visits FROM Purchase p WHERE p.user.id = :userId AND p.shopName IS NOT NULL GROUP BY p.shopName ORDER BY visits DESC")
    List<Object[]> getMostFrequentedShops(@Param("userId") Long userId);

    @Query("SELECT p.moodAtPurchase, SUM(p.amount) FROM Purchase p WHERE p.user.id = :userId AND p.moodAtPurchase IS NOT NULL GROUP BY p.moodAtPurchase")
    List<Object[]> getSpendingByMood(@Param("userId") Long userId);

    @Query("SELECT FUNCTION('HOUR', p.purchasedAt) as hour, COUNT(p) FROM Purchase p WHERE p.user.id = :userId GROUP BY FUNCTION('HOUR', p.purchasedAt) ORDER BY hour")
    List<Object[]> getPurchasesByHourOfDay(@Param("userId") Long userId);

    @Query("SELECT SUM(p.amount) FROM Purchase p WHERE p.user.id = :userId AND p.purchasedAt BETWEEN :start AND :end")
    BigDecimal getTotalSpendingForPeriod(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.category = :category AND p.purchasedAt >= :since ORDER BY p.purchasedAt DESC")
    List<Purchase> findRecentByCategory(@Param("userId") Long userId, @Param("category") Purchase.Category category, @Param("since") LocalDateTime since);

    @Query("SELECT p.color, COUNT(p) FROM Purchase p WHERE p.user.id = :userId AND p.color IS NOT NULL GROUP BY p.color ORDER BY COUNT(p) DESC")
    List<Object[]> getTopColorsBought(@Param("userId") Long userId);
}
