package com.habittracker.controller;

import com.habittracker.dto.PurchaseRequest;
import com.habittracker.dto.PurchaseResponse;
import com.habittracker.model.Purchase;
import com.habittracker.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public ResponseEntity<PurchaseResponse> recordPurchase(@PathVariable Long userId,
                                                            @Valid @RequestBody PurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseService.recordPurchase(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<PurchaseResponse>> getPurchases(@PathVariable Long userId) {
        return ResponseEntity.ok(purchaseService.getPurchasesByUser(userId));
    }

    @GetMapping("/{purchaseId}")
    public ResponseEntity<PurchaseResponse> getPurchase(@PathVariable Long userId,
                                                         @PathVariable Long purchaseId) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(userId, purchaseId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<PurchaseResponse>> getPurchasesByCategory(@PathVariable Long userId,
                                                                          @PathVariable Purchase.Category category) {
        return ResponseEntity.ok(purchaseService.getPurchasesByCategory(userId, category));
    }

    @GetMapping("/impulse")
    public ResponseEntity<List<PurchaseResponse>> getImpulsePurchases(@PathVariable Long userId) {
        return ResponseEntity.ok(purchaseService.getImpulsePurchases(userId));
    }

    @DeleteMapping("/{purchaseId}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long userId,
                                               @PathVariable Long purchaseId) {
        purchaseService.deletePurchase(userId, purchaseId);
        return ResponseEntity.noContent().build();
    }
}
