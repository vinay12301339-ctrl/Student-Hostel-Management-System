# 🛍️ Shopping Habit Tracker

An innovative **Java Spring Boot** application for tracking shopping habits, blending utility, fun, and deep behavioral insights. Go beyond a boring expense tracker—discover *who you are* as a shopper!

## ✨ Features

### 1. 🎯 Habit Radar
Visualize shopping impulses with real-time data showing spending spikes per time-of-day, category, and mood. The `/analytics/dashboard` endpoint returns `habitRadarData` — ready to feed into a radial chart in your frontend.

### 2. 🤖 AI-Powered Nudges
Rule-based nudge engine generates playful notifications to encourage smart spending:
- **Night owl alerts** 🌙 for late-night purchases (10PM–5AM)
- **Impulse spree warnings** 🚨 when impulse buys pile up
- **Big spender alerts** 💸 for large purchases
- **Emotional shopping nudges** 💙 when buying while stressed/sad/anxious

### 3. 🎭 Wishlist vs. Reality — Impulse Surprises
Compare what you *plan* to buy (wishlist) vs. what you *actually* buy. The dashboard generates a monthly "Impulse Surprise" message showing your planned vs. impulse purchase ratio.

### 4. 🏆 Gamification & Badges
Earn badges for responsible shopping milestones:
- ⚔️ **Impulse Slayer** — 7 days without any impulse buys
- 💰 **Budget Master** — Stay under $50 in a month
- 🗺️ **Category Explorer** — Shop in 5+ categories
- 🦉 **Night Owl Reformed** — 2 weeks of daytime-only shopping
- 🎯 **Goal Crusher** — Complete your first shopping goal
- 🔥 **7-Day Streak Breaker** — 7 days of mindful shopping

### 5. 😊 Mood Tracker Integration
Log feelings behind purchases with emoji and notes. Discover your emotional spending triggers through mood frequency analysis and spending-by-mood analytics.

### 6. 🔄 Habit Loop Detector
AI-powered pattern detection identifies repetitive shopping behaviors:
- **Late Night Shopping** — Frequent purchases between 10PM–5AM
- **Category Binge** — Repetitive spending in one category
- **Mood-Triggered Buying** — Shopping when stressed/bored/sad
- Each detected loop includes a **"Break the Loop" challenge**

### 7. 📊 Analytics Dashboards
Fun insights:
- 💸 Monthly spending trends (6-month view)
- 🏪 Most frequented shops
- 😤 Spending by mood
- 🕐 Purchase activity by hour of day
- 🎨 Top colors bought
- 📦 Spending breakdown by category

### 8. 🎯 Customizable Habit Goals
Create quirky goals:
- *"No Coffee Mugs for 2 Months"* (category avoidance)
- *"Stay Under $200 This Month"* (spending limit)
- *"No Buying Streak — 30 Days"* (no-buying challenge)
- *"Wishlist-Only Purchases"* (planned spending only)

---

## 🛠️ Tech Stack

- **Java 17**
- **Spring Boot 3.2** — Web, Data JPA, Validation
- **H2** — In-memory database (zero-config for development)
- **Lombok** — Reduces boilerplate
- **Maven** — Build tool
- **JUnit 5 + Mockito** — Unit testing

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+

### Run the Application

```bash
cd shopping-habit-tracker
mvn spring-boot:run
```

The app starts at **http://localhost:8081**

### H2 Console
Access the in-memory database browser at:
```
http://localhost:8081/h2-console
JDBC URL: jdbc:h2:mem:habitdb
Username: sa
Password: (empty)
```

### Run Tests

```bash
mvn test
```

---

## 📡 API Reference

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users` | Create a new user |
| `GET` | `/api/users/{id}` | Get user profile |
| `GET` | `/api/users` | List all users |
| `PUT` | `/api/users/{id}` | Update user profile |

### Purchases (Shopping Events)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/{userId}/purchases` | Record a purchase |
| `GET` | `/api/users/{userId}/purchases` | Get all purchases |
| `GET` | `/api/users/{userId}/purchases/{id}` | Get single purchase |
| `GET` | `/api/users/{userId}/purchases/category/{category}` | Filter by category |
| `GET` | `/api/users/{userId}/purchases/impulse` | Get impulse purchases only |
| `DELETE` | `/api/users/{userId}/purchases/{id}` | Delete a purchase |

### Habit Analysis & Nudges
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/{userId}/habits/insights` | Habit Radar + Loop detection |
| `GET` | `/api/users/{userId}/habits/nudges` | Get nudges (`?unreadOnly=true`) |
| `GET` | `/api/users/{userId}/habits/nudges/count` | Unread nudge count |
| `PATCH` | `/api/users/{userId}/habits/nudges/{id}/read` | Mark nudge as read |
| `PATCH` | `/api/users/{userId}/habits/nudges/read-all` | Mark all as read |

### Mood Tracker
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/{userId}/moods` | Log a mood |
| `GET` | `/api/users/{userId}/moods` | Get mood history |
| `GET` | `/api/users/{userId}/moods/frequency` | Mood frequency analysis |
| `GET` | `/api/users/{userId}/moods/purchase/{purchaseId}` | Moods for a purchase |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/{userId}/goals` | Create a goal |
| `GET` | `/api/users/{userId}/goals` | All goals |
| `GET` | `/api/users/{userId}/goals/active` | Active goals |
| `GET` | `/api/users/{userId}/goals/achieved` | Achieved goals |
| `PATCH` | `/api/users/{userId}/goals/{id}/achieve` | Mark goal achieved |

### Wishlist (Wishlist vs. Reality)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/{userId}/wishlist` | Add to wishlist |
| `GET` | `/api/users/{userId}/wishlist` | Get full wishlist |
| `GET` | `/api/users/{userId}/wishlist/pending` | Pending items only |
| `PATCH` | `/api/users/{userId}/wishlist/{id}/purchase` | Mark as purchased |
| `PATCH` | `/api/users/{userId}/wishlist/{id}/skip` | Skip an item |
| `DELETE` | `/api/users/{userId}/wishlist/{id}` | Remove from wishlist |

### Badges (Gamification)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/{userId}/badges` | Get all earned badges |

### Analytics Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/{userId}/analytics/dashboard` | Full analytics + insights |

---

## 📊 Example Requests

### Record a Purchase
```json
POST /api/users/1/purchases
{
  "itemName": "Nike Air Max",
  "category": "CLOTHING",
  "amount": 129.99,
  "shopName": "Nike Store",
  "moodAtPurchase": "EXCITED",
  "isImpulseBuy": true,
  "color": "white",
  "notes": "Couldn't resist the sale!"
}
```

### Add to Wishlist
```json
POST /api/users/1/wishlist
{
  "itemName": "MacBook Air M3",
  "category": "ELECTRONICS",
  "estimatedPrice": 1299.00,
  "priority": 1,
  "notes": "Need for work"
}
```

### Create a Quirky Goal
```json
POST /api/users/1/goals
{
  "title": "No Coffee Mugs for 2 Months",
  "type": "CATEGORY_AVOIDANCE",
  "targetCategory": "HOME_DECOR",
  "quirkyDescription": "The mug collection shall grow no further! ☕🚫"
}
```

### Log a Mood
```json
POST /api/users/1/moods
{
  "moodType": "STRESS",
  "emoji": "😤",
  "intensity": 8,
  "note": "Had a rough day at work",
  "trigger": "work deadline",
  "purchaseId": 5
}
```

---

## 🗂️ Project Structure

```
shopping-habit-tracker/
├── src/main/java/com/habittracker/
│   ├── ShoppingHabitTrackerApplication.java   # Main entry point
│   ├── DataInitializer.java                    # Demo data seeder
│   ├── model/                                  # JPA domain models
│   │   ├── User.java                           # Shopper profiles
│   │   ├── Purchase.java                       # Shopping events
│   │   ├── Habit.java                          # Detected habit patterns
│   │   ├── Mood.java                           # Emotional logs
│   │   ├── Goal.java                           # Custom shopping goals
│   │   ├── Nudge.java                          # AI-powered notifications
│   │   ├── Badge.java                          # Gamification rewards
│   │   └── WishlistItem.java                   # Planned purchases
│   ├── repository/                             # Spring Data JPA repos
│   ├── service/                                # Core business logic
│   │   ├── PurchaseService.java
│   │   ├── NudgeService.java                   # AI nudge engine
│   │   ├── HabitAnalysisService.java           # Loop detection
│   │   ├── GamificationService.java            # Badges & points
│   │   ├── AnalyticsService.java               # Dashboard data
│   │   ├── GoalService.java
│   │   ├── MoodService.java
│   │   ├── WishlistService.java
│   │   └── UserService.java
│   ├── controller/                             # REST API endpoints
│   │   ├── UserController.java
│   │   ├── PurchaseController.java
│   │   ├── HabitController.java
│   │   ├── MoodController.java
│   │   ├── GoalController.java
│   │   ├── AnalyticsController.java
│   │   ├── BadgeController.java
│   │   └── WishlistController.java
│   ├── dto/                                    # Request/Response DTOs
│   └── config/                                 # CORS + Exception handling
└── src/test/java/com/habittracker/
    ├── ShoppingHabitTrackerApplicationTests.java
    └── service/
        ├── UserServiceTest.java
        ├── PurchaseServiceTest.java
        ├── NudgeServiceTest.java
        └── GamificationServiceTest.java
```

---

## 🌱 Demo Data

On startup, the app seeds two demo users:

| User | Personality | Email |
|------|-------------|-------|
| `alice_shops` | Impulse Buyer 🛍️ | alice@demo.com |
| `bob_budget` | Minimalist 💰 | bob@demo.com |

With pre-loaded purchases, wishlist items, and goals to explore the dashboard immediately.

---

## 🔮 Future Ideas
- OAuth2 / JWT authentication
- WebSocket real-time nudge push
- Integration with weather APIs for "Spending by Weather" dashboard
- Secret Santa mode for anonymous gift tracking
- Shareable social media infographic exports
- Machine learning model for smarter habit loop detection
