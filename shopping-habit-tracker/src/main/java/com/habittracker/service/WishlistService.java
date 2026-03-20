package com.habittracker.service;

import com.habittracker.dto.WishlistItemRequest;
import com.habittracker.model.Purchase;
import com.habittracker.model.User;
import com.habittracker.model.WishlistItem;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.UserRepository;
import com.habittracker.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;

    @Transactional
    public WishlistItem addToWishlist(Long userId, WishlistItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setItemName(request.getItemName());
        item.setCategory(request.getCategory());
        item.setEstimatedPrice(request.getEstimatedPrice());
        item.setShopName(request.getShopName());
        item.setUrl(request.getUrl());
        item.setPriority(request.getPriority());
        item.setNotes(request.getNotes());
        item.setStatus(WishlistItem.WishlistStatus.PENDING);

        return wishlistItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<WishlistItem> getWishlist(Long userId) {
        return wishlistItemRepository.findByUserIdOrderByPriorityAsc(userId);
    }

    @Transactional(readOnly = true)
    public List<WishlistItem> getPendingWishlistItems(Long userId) {
        return wishlistItemRepository.findByUserIdAndStatus(userId, WishlistItem.WishlistStatus.PENDING);
    }

    @Transactional
    public WishlistItem markAsPurchased(Long userId, Long itemId, Long purchaseId) {
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist item not found: " + itemId));
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Item does not belong to user");
        }

        item.setStatus(WishlistItem.WishlistStatus.PURCHASED);
        item.setFulfilledAt(LocalDateTime.now());

        if (purchaseId != null) {
            Purchase purchase = purchaseRepository.findById(purchaseId).orElse(null);
            item.setFulfilledByPurchase(purchase);
        }

        return wishlistItemRepository.save(item);
    }

    @Transactional
    public WishlistItem skipItem(Long userId, Long itemId) {
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist item not found: " + itemId));
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Item does not belong to user");
        }
        item.setStatus(WishlistItem.WishlistStatus.SKIPPED);
        return wishlistItemRepository.save(item);
    }

    @Transactional
    public void deleteWishlistItem(Long userId, Long itemId) {
        WishlistItem item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Wishlist item not found: " + itemId));
        if (!item.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Item does not belong to user");
        }
        wishlistItemRepository.delete(item);
    }
}
