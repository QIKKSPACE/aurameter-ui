# Snake Game - Food Items Documentation

## Overview
The Snake game features 5 different types of food items, each with unique properties, spawn conditions, and effects on gameplay.

---

## 🍎 Normal Apple (Cyan/Accent Color)

### Properties
- **Color**: Theme accent color (cyan #97deff)
- **ID**: `"normal"`
- **Point Value**: 1 point per apple
- **Multiplier Effect**: YES - Points affected by current combo multiplier
- **Spawn Conditions**: Always available, spawns on every food pickup
- **Spawn Probability**: 100% (always spawns)
- **Visual**: Standard apple indicator

### Mechanics
- Basic food item found throughout the game
- Awards base points that are multiplied by the combo multiplier
- Example: At 4x multiplier, normal apple = 4 points
- No special effects or power-ups
- Eating normal apples builds combo streaks

### Scoring Example
- Combo streak: None (multiplier 1x) → 1 point
- Combo streak: 1 (multiplier 1.5x) → 1.5 points
- Combo streak: 3 (multiplier 2.5x) → 2.5 points

### Tracking
- `normalApplesEaten` counter increments when eaten
- Counter used to gate Red Apple spawning (see Red Apple section)

---

## 🟡 Golden Apple (Yellow #F4C542)

### Properties
- **Color**: Golden yellow (#F4C542)
- **ID**: `"golden"`
- **Point Value**: 5 points per apple
- **Multiplier Effect**: YES - Points affected by combo multiplier
- **Spawn Conditions**: Score ≥ 8 points
- **Spawn Probability**: ~22% chance (spawns if random > 0.78)
- **Visual**: Distinct golden color for quick identification

### Mechanics
- Rare variant that appears as player progresses
- Higher fixed point value than normal apples
- Still affected by combo multiplier bonus
- Encourages seeking out these special items
- Maintains combo streak when eaten

### Scoring Example
- No combo (1x multiplier) → 5 points
- 1-apple combo (1.5x) → 7.5 points
- 3-apple combo (2.5x) → 12.5 points

### Spawn Rules
```
if (score ≥ 8 AND random > 0.78):
  25% chance to spawn
else:
  spawn normal apple
```

---

## 🚀 Speed Boost Apple (Orange #FF7A59)

### Properties
- **Color**: Orange (#FF7A59)
- **ID**: `"speed"`
- **Point Value**: 2 points per apple
- **Multiplier Effect**: YES - Points affected by combo multiplier
- **Spawn Conditions**: Score ≥ 5 points
- **Spawn Probability**: ~37% chance (spawns if random > 0.63)
- **Visual**: Orange color indicates speed boost

### Mechanics
- Grants temporary speed boost to the snake
- Speed boost duration: 18 moves with reduced game tick speed
- Reduced tick speed increases snake movement speed by making game loop faster
- Also provides standard point value
- Resets speedBoostMoves counter when eaten

### Gameplay Effect
- Current base tick speed is reduced further for 18 moves
- Makes snake move noticeably faster and harder to control
- Useful for aggressive play but risky
- Combo still continues even with speed boost active

### Spawn Rules
```
if (score ≥ 5 AND random > 0.63):
  ~37% chance to spawn
else:
  spawn normal apple or lower-tier food
```

### Speed Boost Mechanics
```
speedBoostMoves = 18  // When eaten
// Each game tick decreases by 1 until reaches 0
// While speedBoostMoves > 0, game runs faster
```

---

## 🛡️ Shield Apple (Green #7CF29A)

### Properties
- **Color**: Green (#7CF29A)
- **ID**: `"shield"`
- **Point Value**: 2 points per apple
- **Multiplier Effect**: YES - Points affected by combo multiplier
- **Spawn Conditions**: Score ≥ 12 points
- **Spawn Probability**: ~10% chance (spawns if random > 0.9) - Rarest spawn
- **Visual**: Green color indicates protection
- **Shield Charges**: +1 charge per apple eaten

### Mechanics
- Grants one free collision survival (like a life buffer)
- Each shield charge protects from ONE wall/self-collision
- When snake collides with itself or obstacle, shield charge is consumed instead of game over
- Can stack multiple shield charges (no maximum cap)
- Still provides standard points

### Gameplay Effect
- Missing a turn won't end game immediately
- Provides safety net for risky plays
- Encourages more aggressive gameplay
- Can be strategic to collect before making tight maneuvers

### Shield Activation
```
if (collision detected):
  if (shieldCharges > 0):
    shieldCharges -= 1  // Consume one charge
    play_impact_haptic()
    continue game
  else:
    gameOver = true
```

### Spawn Rules
```
if (score ≥ 12 AND random > 0.9):
  ~10% chance to spawn (rarest)
else:
  spawn lower-tier food
```

---

## 🔴 Red Apple (Deep Red #E63946)

### Properties
- **Color**: Deep red (#E63946)
- **ID**: `"red_apple"`
- **Point Value**: 5 points per apple (FIXED - no multiplier bonus)
- **Multiplier Effect**: NO - Always exactly 5 points, ignores combo
- **Spawn Conditions**: 
  - Must have eaten ≥ 7 normal apples first
  - Spawns every 8 seconds after gate is met
- **Spawn Probability**: 100% (every 8 seconds after gate)
- **Auto-Despawn**: Disappears after 5 seconds if not eaten
- **Visual**: Deep red distinct color for visibility

### Mechanics
- Special timed food item that only appears after earning 7 normal apples
- Replaces current food on the board when it spawns
- Limited time availability creates urgency to collect
- Fixed 5-point reward regardless of combo multiplier
- Fast-paced risk/reward mechanic

### Spawn Rules
```
if (normalApplesEaten ≥ 7):
  Every 8 seconds:
    if (currentFood != red_apple):
      spawn red_apple at random position
      set 5-second despawn timer
```

### Timeline
1. **T=0s**: Red apple spawns when timer triggers
2. **T=0-5s**: Player has chance to collect it
3. **T=5s**: If not eaten, red apple disappears
4. **T=5+s**: Regular food spawns, timer resets
5. **T=8s**: Next red apple spawn cycle begins

### Scoring
```
Red Apple eaten:
  score += 5  // Always, never multiplied
  // Compare to normal apple at high combo:
  normal apple (3x combo) = 3 points
  red apple = 5 points fixed
```

### Strategy
- Collect if convenient, but don't sacrifice combo
- 5 points > normal apple even with low multiplier (1x)
- Disappears quickly, creates time-pressure decisions
- Gate at 7 normal apples prevents early game clutter

---

## 📊 Spawn Rate Summary

| Food Type | Min Score | Spawn Chance | Rarity |
|-----------|-----------|--------------|--------|
| Normal | 0 | 100% | Always |
| Golden | 8+ | 22-25% | Common |
| Speed | 5+ | 37% | Common |
| Shield | 12+ | 10% | Rare |
| Red | 7 normal eaten | Every 8s | Special |

**Note**: Probabilities are conditional on score thresholds and other RNG factors.

---

## 🎮 Gameplay Strategy

### Early Game (Score 0-8)
- Only normal apples spawn
- Build up combo streaks
- Collect 7 normal apples to unlock red apples

### Mid Game (Score 8-12)
- Golden apples start appearing (~25% chance)
- Speed boosts provide risk/reward
- Accumulate shield charges for safety
- Approaching red apple unlock

### Late Game (Score 12+)
- All food types available
- Red apples spawn every 8s (post-unlock)
- Focus on maintaining multiplier
- Use shields strategically before risky maneuvers

---

## 🔧 Configuration (GameConfig.ts)

```typescript
FOOD_POINTS: {
  normal: 1,        // Base points
  golden: 5,        // High value, rare
  speed: 2,         // Speed boost effect
  shield: 2,        // Protection effect
  red_apple: 5,     // Fixed value, no multiplier
}

FOOD_SPAWN_THRESHOLDS: {
  shield: { minScore: 12, probability: 0.9 },
  golden: { minScore: 8, probability: 0.78 },
  speed: { minScore: 5, probability: 0.63 },
}

RED_APPLE_SPAWN_GATE: 7,      // Eat 7 normal apples first
RED_APPLE_SPAWN_INTERVAL: 8000,   // Every 8 seconds
RED_APPLE_LIFETIME: 5000,     // Visible for 5 seconds
```

---

## 🎯 Food Item Effects on Game State

| Action | Normal | Golden | Speed | Shield | Red |
|--------|--------|--------|-------|--------|-----|
| Add Points | Yes | Yes | Yes | Yes | Yes |
| Apply Multiplier | Yes | Yes | Yes | Yes | **No** |
| Maintain Combo | Yes | Yes | Yes | Yes | Yes |
| Add Special Effect | - | - | +18 speed moves | +1 shield charge | None |
| Auto-Despawn | No | No | No | No | **Yes (5s)** |

---

## 💡 Quick Reference

**Healthiest Option**: Shield Apple (protection + points)
**Most Valuable**: Red Apple (highest fixed value, creates urgency)
**Highest Potential with Combo**: Golden Apple (5 base × high multiplier)
**Most Exciting**: Speed Boost (adds gameplay challenge)
**Most Common**: Normal Apple (foundation of scoring)
