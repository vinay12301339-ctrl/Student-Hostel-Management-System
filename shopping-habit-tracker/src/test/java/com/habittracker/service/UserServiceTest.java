package com.habittracker.service;

import com.habittracker.dto.UserRequest;
import com.habittracker.dto.UserResponse;
import com.habittracker.model.User;
import com.habittracker.repository.BadgeRepository;
import com.habittracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BadgeRepository badgeRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("test@example.com");
        sampleUser.setDisplayName("Test User");
        sampleUser.setShopperPersonality(User.ShopperPersonality.EXPLORER);
        sampleUser.setTotalPoints(0);
    }

    @Test
    void createUser_success() {
        UserRequest req = new UserRequest();
        req.setUsername("testuser");
        req.setEmail("test@example.com");
        req.setDisplayName("Test User");
        req.setShopperPersonality(User.ShopperPersonality.EXPLORER);

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(badgeRepository.findByUserIdOrderByEarnedAtDesc(1L)).thenReturn(Collections.emptyList());

        UserResponse response = userService.createUser(req);

        assertThat(response).isNotNull();
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_duplicateUsername_throwsException() {
        UserRequest req = new UserRequest();
        req.setUsername("testuser");
        req.setEmail("new@example.com");

        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    void createUser_duplicateEmail_throwsException() {
        UserRequest req = new UserRequest();
        req.setUsername("newuser");
        req.setEmail("test@example.com");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    void getUserById_found() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(badgeRepository.findByUserIdOrderByEarnedAtDesc(1L)).thenReturn(Collections.emptyList());

        UserResponse response = userService.getUserById(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("testuser");
    }

    @Test
    void getUserById_notFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void addPoints_updatesUserPoints() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        userService.addPoints(1L, 100);

        assertThat(sampleUser.getTotalPoints()).isEqualTo(100);
        verify(userRepository).save(sampleUser);
    }
}
