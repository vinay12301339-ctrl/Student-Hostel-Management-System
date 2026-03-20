package com.habittracker.service;

import com.habittracker.dto.PurchaseRequest;
import com.habittracker.dto.PurchaseResponse;
import com.habittracker.model.Purchase;
import com.habittracker.model.User;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final NudgeService nudgeService;
    private final GamificationService gamificationService;
    private final HabitAnalysisService habitAnalysisService;

    @Transactional
    public PurchaseResponse recordPurchase(Long userId, PurchaseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Purchase purchase = new Purchase();
        purchase.setUser(user);
        purchase.setItemName(request.getItemName());
        purchase.setCategory(request.getCategory());
        purchase.setAmount(request.getAmount());
        purchase.setShopName(request.getShopName());
        purchase.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        purchase.setMoodAtPurchase(request.getMoodAtPurchase());
        purchase.setMoodNote(request.getMoodNote());
        purchase.setImpulseBuy(request.isImpulseBuy());
        purchase.setWishlistItem(request.isWishlistItem());
        purchase.setNotes(request.getNotes());
        purchase.setWeatherAtPurchase(request.getWeatherAtPurchase());
        purchase.setColor(request.getColor());

        if (request.getPurchasedAt() != null) {
            purchase.setPurchasedAt(request.getPurchasedAt());
        } else {
            purchase.setPurchasedAt(LocalDateTime.now());
        }

        Purchase saved = purchaseRepository.save(purchase);

        // Trigger post-purchase processing asynchronously
        nudgeService.generatePostPurchaseNudges(userId, saved);
        gamificationService.processPurchaseAchievements(userId, saved);
        habitAnalysisService.analyzeAfterPurchase(userId, saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getPurchasesByUser(Long userId) {
        return purchaseRepository.findByUserIdOrderByPurchasedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getPurchasesByCategory(Long userId, Purchase.Category category) {
        return purchaseRepository.findByUserIdAndCategory(userId, category)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> getImpulsePurchases(Long userId) {
        return purchaseRepository.findByUserIdAndIsImpulseBuyTrue(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long userId, Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + purchaseId));
        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Purchase does not belong to user");
        }
        return toResponse(purchase);
    }

    @Transactional
    public void deletePurchase(Long userId, Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase not found: " + purchaseId));
        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Purchase does not belong to user");
        }
        purchaseRepository.delete(purchase);
    }

    public PurchaseResponse toResponse(Purchase p) {
        PurchaseResponse resp = new PurchaseResponse();
        resp.setId(p.getId());
        resp.setItemName(p.getItemName());
        resp.setCategory(p.getCategory());
        resp.setAmount(p.getAmount());
        resp.setCurrency(p.getCurrency());
        resp.setShopName(p.getShopName());
        resp.setMoodAtPurchase(p.getMoodAtPurchase());
        resp.setMoodNote(p.getMoodNote());
        resp.setImpulseBuy(p.isImpulseBuy());
        resp.setWishlistItem(p.isWishlistItem());
        resp.setNotes(p.getNotes());
        resp.setPurchasedAt(p.getPurchasedAt());
        resp.setWeatherAtPurchase(p.getWeatherAtPurchase());
        resp.setColor(p.getColor());
        resp.setCreatedAt(p.getCreatedAt());
        return resp;
    }
}
