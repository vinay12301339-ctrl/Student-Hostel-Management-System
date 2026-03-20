package com.habittracker.service;

import com.habittracker.dto.UserRequest;
import com.habittracker.dto.UserResponse;
import com.habittracker.model.User;
import com.habittracker.repository.BadgeRepository;
import com.habittracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;

    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setDisplayName(request.getDisplayName() != null ? request.getDisplayName() : request.getUsername());
        user.setShopperPersonality(request.getShopperPersonality());

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if (!user.getUsername().equals(request.getUsername()) &&
                userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getShopperPersonality() != null) {
            user.setShopperPersonality(request.getShopperPersonality());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void addPoints(Long userId, int points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setTotalPoints(user.getTotalPoints() + points);
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setDisplayName(user.getDisplayName());
        resp.setShopperPersonality(user.getShopperPersonality());
        resp.setTotalPoints(user.getTotalPoints());
        resp.setStreakDays(user.getStreakDays());
        resp.setBadgeCount((int) badgeRepository.findByUserIdOrderByEarnedAtDesc(user.getId()).size());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }
}
