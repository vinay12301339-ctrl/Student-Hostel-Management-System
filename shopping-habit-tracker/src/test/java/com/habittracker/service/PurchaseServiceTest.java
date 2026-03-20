package com.habittracker.service;

import com.habittracker.dto.PurchaseRequest;
import com.habittracker.dto.PurchaseResponse;
import com.habittracker.model.Purchase;
import com.habittracker.model.User;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NudgeService nudgeService;

    @Mock
    private GamificationService gamificationService;

    @Mock
    private HabitAnalysisService habitAnalysisService;

    @InjectMocks
    private PurchaseService purchaseService;

    private User sampleUser;
    private Purchase samplePurchase;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("test@example.com");

        samplePurchase = new Purchase();
        samplePurchase.setId(10L);
        samplePurchase.setUser(sampleUser);
        samplePurchase.setItemName("Test Item");
        samplePurchase.setCategory(Purchase.Category.ELECTRONICS);
        samplePurchase.setAmount(new BigDecimal("99.99"));
        samplePurchase.setCurrency("USD");
        samplePurchase.setPurchasedAt(LocalDateTime.now());
    }

    @Test
    void recordPurchase_success() {
        PurchaseRequest req = new PurchaseRequest();
        req.setItemName("Test Item");
        req.setCategory(Purchase.Category.ELECTRONICS);
        req.setAmount(new BigDecimal("99.99"));
        req.setImpulseBuy(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(purchaseRepository.save(any(Purchase.class))).thenReturn(samplePurchase);
        doNothing().when(nudgeService).generatePostPurchaseNudges(anyLong(), any(Purchase.class));
        doNothing().when(gamificationService).processPurchaseAchievements(anyLong(), any(Purchase.class));
        doNothing().when(habitAnalysisService).analyzeAfterPurchase(anyLong(), any(Purchase.class));

        PurchaseResponse response = purchaseService.recordPurchase(1L, req);

        assertThat(response).isNotNull();
        assertThat(response.getItemName()).isEqualTo("Test Item");
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("99.99"));
        verify(purchaseRepository).save(any(Purchase.class));
        verify(nudgeService).generatePostPurchaseNudges(eq(1L), any(Purchase.class));
    }

    @Test
    void recordPurchase_userNotFound_throwsException() {
        PurchaseRequest req = new PurchaseRequest();
        req.setItemName("Item");
        req.setCategory(Purchase.Category.BOOKS);
        req.setAmount(BigDecimal.TEN);

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> purchaseService.recordPurchase(99L, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getImpulsePurchases_returnsOnlyImpulse() {
        samplePurchase.setImpulseBuy(true);
        when(purchaseRepository.findByUserIdAndIsImpulseBuyTrue(1L))
                .thenReturn(List.of(samplePurchase));

        List<PurchaseResponse> result = purchaseService.getImpulsePurchases(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isImpulseBuy()).isTrue();
    }

    @Test
    void getPurchasesByUser_returnsList() {
        when(purchaseRepository.findByUserIdOrderByPurchasedAtDesc(1L))
                .thenReturn(List.of(samplePurchase));

        List<PurchaseResponse> result = purchaseService.getPurchasesByUser(1L);

        assertThat(result).hasSize(1);
    }

    @Test
    void deletePurchase_wrongUser_throwsException() {
        User anotherUser = new User();
        anotherUser.setId(2L);
        samplePurchase.setUser(anotherUser);

        when(purchaseRepository.findById(10L)).thenReturn(Optional.of(samplePurchase));

        assertThatThrownBy(() -> purchaseService.deletePurchase(1L, 10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to user");
    }
}
