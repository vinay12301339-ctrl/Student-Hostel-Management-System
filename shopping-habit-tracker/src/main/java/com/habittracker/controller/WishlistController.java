package com.habittracker.controller;

import com.habittracker.dto.WishlistItemRequest;
import com.habittracker.model.WishlistItem;
import com.habittracker.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping
    public ResponseEntity<WishlistItem> addToWishlist(@PathVariable Long userId,
                                                       @Valid @RequestBody WishlistItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(wishlistService.addToWishlist(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<WishlistItem>> getPendingItems(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getPendingWishlistItems(userId));
    }

    @PatchMapping("/{itemId}/purchase")
    public ResponseEntity<WishlistItem> markAsPurchased(@PathVariable Long userId,
                                                         @PathVariable Long itemId,
                                                         @RequestParam(required = false) Long purchaseId) {
        return ResponseEntity.ok(wishlistService.markAsPurchased(userId, itemId, purchaseId));
    }

    @PatchMapping("/{itemId}/skip")
    public ResponseEntity<WishlistItem> skipItem(@PathVariable Long userId,
                                                  @PathVariable Long itemId) {
        return ResponseEntity.ok(wishlistService.skipItem(userId, itemId));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long userId,
                                           @PathVariable Long itemId) {
        wishlistService.deleteWishlistItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }
}
