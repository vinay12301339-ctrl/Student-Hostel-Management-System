package com.habittracker;

import com.habittracker.model.*;
import com.habittracker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DataInitializer: Seeds demo data for development and testing.
 * Only runs with the 'dev' or 'default' Spring profile.
 */
@Component
@Profile({"dev", "default"})
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PurchaseRepository purchaseRepository;
    private final GoalRepository goalRepository;
    private final WishlistItemRepository wishlistItemRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Demo data already exists, skipping seed.");
            return;
        }

        log.info("🌱 Seeding demo data for Shopping Habit Tracker...");

        // Create demo user
        User alice = new User();
        alice.setUsername("alice_shops");
        alice.setEmail("alice@demo.com");
        alice.setDisplayName("Alice 🛍️");
        alice.setShopperPersonality(User.ShopperPersonality.IMPULSE_BUYER);
        alice.setTotalPoints(350);
        userRepository.save(alice);

        User bob = new User();
        bob.setUsername("bob_budget");
        bob.setEmail("bob@demo.com");
        bob.setDisplayName("Bob 💰");
        bob.setShopperPersonality(User.ShopperPersonality.MINIMALIST);
        bob.setTotalPoints(800);
        userRepository.save(bob);

        // Seed purchases for Alice
        seedPurchase(alice, "Nike Sneakers", Purchase.Category.CLOTHING, "89.99",
                "Nike Store", Purchase.MoodAtPurchase.EXCITED, true, false,
                LocalDateTime.now().minusDays(2), "black");

        seedPurchase(alice, "Spotify Premium", Purchase.Category.ENTERTAINMENT, "9.99",
                "Spotify", Purchase.MoodAtPurchase.CONTENT, false, true,
                LocalDateTime.now().minusDays(5), null);

        seedPurchase(alice, "Sushi Dinner", Purchase.Category.FOOD_DRINKS, "45.00",
                "Tokyo Garden", Purchase.MoodAtPurchase.HAPPY, false, false,
                LocalDateTime.now().minusDays(1), null);

        seedPurchase(alice, "Plant Pot", Purchase.Category.HOME_DECOR, "22.50",
                "IKEA", Purchase.MoodAtPurchase.BORED, true, false,
                LocalDateTime.now().minusDays(3).withHour(23), "terracotta");

        seedPurchase(alice, "Mystery Novel", Purchase.Category.BOOKS, "14.99",
                "Barnes & Noble", Purchase.MoodAtPurchase.CONTENT, false, true,
                LocalDateTime.now().minusDays(7), null);

        // Seed purchases for Bob
        seedPurchase(bob, "Coffee Beans", Purchase.Category.FOOD_DRINKS, "18.00",
                "Local Roaster", Purchase.MoodAtPurchase.HAPPY, false, true,
                LocalDateTime.now().minusDays(1), "brown");

        seedPurchase(bob, "Running Shoes", Purchase.Category.SPORTS, "120.00",
                "REI", Purchase.MoodAtPurchase.EXCITED, false, true,
                LocalDateTime.now().minusDays(10), "blue");

        // Seed wishlist
        WishlistItem macbook = new WishlistItem();
        macbook.setUser(alice);
        macbook.setItemName("MacBook Air M3");
        macbook.setCategory(Purchase.Category.ELECTRONICS);
        macbook.setEstimatedPrice(new BigDecimal("1299.00"));
        macbook.setShopName("Apple Store");
        macbook.setPriority(1);
        macbook.setNotes("For work and photo editing");
        wishlistItemRepository.save(macbook);

        WishlistItem coffeeMaker = new WishlistItem();
        coffeeMaker.setUser(alice);
        coffeeMaker.setItemName("Nespresso Machine");
        coffeeMaker.setCategory(Purchase.Category.HOME_DECOR);
        coffeeMaker.setEstimatedPrice(new BigDecimal("150.00"));
        coffeeMaker.setPriority(2);
        wishlistItemRepository.save(coffeeMaker);

        // Seed goals
        Goal spendingGoal = new Goal();
        spendingGoal.setUser(alice);
        spendingGoal.setTitle("No Coffee Mugs for 2 Months");
        spendingGoal.setDescription("Already have 12 mugs. That's enough!");
        spendingGoal.setType(Goal.GoalType.CATEGORY_AVOIDANCE);
        spendingGoal.setTargetCategory(Purchase.Category.HOME_DECOR);
        spendingGoal.setQuirkyDescription("The mug collection shall grow no further! ☕🚫");
        goalRepository.save(spendingGoal);

        Goal budgetGoal = new Goal();
        budgetGoal.setUser(bob);
        budgetGoal.setTitle("Stay Under $200 This Month");
        budgetGoal.setDescription("Saving for a road trip!");
        budgetGoal.setType(Goal.GoalType.SPENDING_LIMIT);
        budgetGoal.setSpendingLimit(new BigDecimal("200.00"));
        budgetGoal.setQuirkyDescription("Road trip > impulse buys 🚗✨");
        goalRepository.save(budgetGoal);

        log.info("✅ Demo data seeded successfully! Users: alice_shops, bob_budget");
    }

    private void seedPurchase(User user, String itemName, Purchase.Category category,
                               String amount, String shopName, Purchase.MoodAtPurchase mood,
                               boolean isImpulse, boolean isWishlist,
                               LocalDateTime purchasedAt, String color) {
        Purchase p = new Purchase();
        p.setUser(user);
        p.setItemName(itemName);
        p.setCategory(category);
        p.setAmount(new BigDecimal(amount));
        p.setShopName(shopName);
        p.setMoodAtPurchase(mood);
        p.setImpulseBuy(isImpulse);
        p.setWishlistItem(isWishlist);
        p.setPurchasedAt(purchasedAt);
        p.setColor(color);
        purchaseRepository.save(p);
    }
}
