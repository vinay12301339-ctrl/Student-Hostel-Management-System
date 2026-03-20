package com.habittracker.service;

import com.habittracker.model.*;
import com.habittracker.repository.NudgeRepository;
import com.habittracker.repository.PurchaseRepository;
import com.habittracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NudgeServiceTest {

    @Mock
    private NudgeRepository nudgeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @InjectMocks
    private NudgeService nudgeService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("test@example.com");
    }

    @Test
    void generatePostPurchaseNudges_lateNightPurchase_createsNudge() {
        Purchase purchase = new Purchase();
        purchase.setItemName("Phone Case");
        purchase.setAmount(new BigDecimal("15.00"));
        purchase.setImpulseBuy(false);
        purchase.setPurchasedAt(LocalDateTime.now().withHour(23));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(nudgeRepository.save(any(Nudge.class))).thenAnswer(inv -> inv.getArgument(0));

        nudgeService.generatePostPurchaseNudges(1L, purchase);

        ArgumentCaptor<Nudge> captor = ArgumentCaptor.forClass(Nudge.class);
        verify(nudgeRepository, atLeastOnce()).save(captor.capture());

        List<Nudge> savedNudges = captor.getAllValues();
        assertThat(savedNudges).isNotEmpty();
        boolean hasLateNightNudge = savedNudges.stream()
                .anyMatch(n -> n.getMessage().contains("Night owl alert"));
        assertThat(hasLateNightNudge).isTrue();
    }

    @Test
    void generatePostPurchaseNudges_impulse_createsImpulseNudge() {
        Purchase purchase = new Purchase();
        purchase.setItemName("Random Item");
        purchase.setAmount(new BigDecimal("25.00"));
        purchase.setImpulseBuy(true);
        purchase.setPurchasedAt(LocalDateTime.now().withHour(14));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(purchaseRepository.findByUserIdAndIsImpulseBuyTrue(1L)).thenReturn(Collections.emptyList());
        when(nudgeRepository.save(any(Nudge.class))).thenAnswer(inv -> inv.getArgument(0));

        nudgeService.generatePostPurchaseNudges(1L, purchase);

        ArgumentCaptor<Nudge> captor = ArgumentCaptor.forClass(Nudge.class);
        verify(nudgeRepository, atLeastOnce()).save(captor.capture());

        boolean hasImpulseNudge = captor.getAllValues().stream()
                .anyMatch(n -> n.getMessage().contains("impulse"));
        assertThat(hasImpulseNudge).isTrue();
    }

    @Test
    void generatePostPurchaseNudges_largePurchase_createsSpendingAlert() {
        Purchase purchase = new Purchase();
        purchase.setItemName("Laptop");
        purchase.setAmount(new BigDecimal("1200.00"));
        purchase.setCurrency("USD");
        purchase.setImpulseBuy(false);
        purchase.setPurchasedAt(LocalDateTime.now().withHour(14));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(nudgeRepository.save(any(Nudge.class))).thenAnswer(inv -> inv.getArgument(0));

        nudgeService.generatePostPurchaseNudges(1L, purchase);

        ArgumentCaptor<Nudge> captor = ArgumentCaptor.forClass(Nudge.class);
        verify(nudgeRepository, atLeastOnce()).save(captor.capture());

        boolean hasSpendingAlert = captor.getAllValues().stream()
                .anyMatch(n -> n.getType() == Nudge.NudgeType.SPENDING_ALERT);
        assertThat(hasSpendingAlert).isTrue();
    }

    @Test
    void markNudgeAsRead_setsReadFlag() {
        Nudge nudge = new Nudge();
        nudge.setId(1L);
        nudge.setUser(sampleUser);
        nudge.setRead(false);
        nudge.setMessage("Test nudge");
        nudge.setType(Nudge.NudgeType.MOOD_CHECK);

        when(nudgeRepository.findById(1L)).thenReturn(Optional.of(nudge));
        when(nudgeRepository.save(any(Nudge.class))).thenAnswer(inv -> inv.getArgument(0));

        nudgeService.markNudgeAsRead(1L, 1L);

        assertThat(nudge.isRead()).isTrue();
        assertThat(nudge.getReadAt()).isNotNull();
    }

    @Test
    void getUnreadCount_returnsCorrectCount() {
        when(nudgeRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        long count = nudgeService.getUnreadCount(1L);

        assertThat(count).isEqualTo(5L);
    }

    @Test
    void generateHabitLoopNudge_createsLoopWarning() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(nudgeRepository.save(any(Nudge.class))).thenAnswer(inv -> inv.getArgument(0));

        nudgeService.generateHabitLoopNudge(1L, "Late Night Shopping", 6);

        ArgumentCaptor<Nudge> captor = ArgumentCaptor.forClass(Nudge.class);
        verify(nudgeRepository).save(captor.capture());

        Nudge saved = captor.getValue();
        assertThat(saved.getType()).isEqualTo(Nudge.NudgeType.HABIT_LOOP_WARNING);
        assertThat(saved.getMessage()).contains("Late Night Shopping");
        assertThat(saved.getMessage()).contains("6");
    }
}
