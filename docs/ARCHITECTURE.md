# GlucoseWars Architecture

## 🏗️ Core Principles

### 1. ENHANCEMENT FIRST
Extend existing components before creating new ones

### 2. AGGRESSIVE CONSOLIDATION  
Delete unnecessary code rather than deprecating

### 3. PREVENT BLOAT
Config-driven behavior, single source of truth

### 4. DRY
Single source of truth for all shared logic

### 5. CLEAN
Clear separation of concerns with explicit dependencies

### 6. MODULAR
Composable, testable, independent modules

### 7. PERFORMANT
Adaptive loading, caching, and resource optimization

### 8. ORGANIZED
Predictable file structure with domain-driven design

## 🎮 System Overview

### High-Level Architecture
```
📱 App Launch
├── usePlayerProgress()  # Load state
├── GAME_TIERS[tier]     # Get config
├── WelcomeBack         # Returning flow
├── OnboardingForTier    # Tier onboarding
├── BattleScreen         # Gameplay
└── ResultsScroll        # Results
```

### Key Components

#### Tier Configuration
```typescript
// constants/gameTiers.ts
export const GAME_TIERS = {
  tier1: { duration: 30, showGlucose: false, ... },
  tier2: { duration: 60, showGlucose: true, ... },
  tier3: { duration: 90, showGlucose: true, ... }
}
```

#### Player Progress
```typescript
// hooks/usePlayerProgress.ts
const { progress, unlockNextTier } = usePlayerProgress()
```

#### Config-Driven UI
```typescript
// BattleScreen.tsx
<BattleScreen 
  tierConfig={GAME_TIERS[progress.currentTier]}
  healthProfile={tierConfig.healthProfile ? healthProfile : undefined}
/>
```

## 📊 Technical Decisions

### Tiered Progression
**Problem:** Modal choice caused choice paralysis and cognitive overload

**Solution:** Linear progression with progressive disclosure

### Config-Driven
**Before:** Complex branching logic
```typescript
if (gameMode === 'life') { /* ... */ }
```

**After:** Simple config checks
```typescript
if (tierConfig.showGlucose) { /* ... */ }
```

### Local-First
1. Offline capable
2. Fast (no network latency)
3. Progressive enhancement to Scroll

## 🛠️ File Structure

```
📁 Project Structure
├── constants/
│   └── gameTiers.ts      # Tier configurations
├── hooks/
│   └── usePlayerProgress.ts # Progression tracking
├── components/game/
│   ├── WelcomeBack.tsx   # Returning player flow
│   └── OnboardingForTier.tsx # Tier onboarding
├── types/
│   ├── game.ts          # Game types
│   └── health.ts        # Health types
└── app/
    └── index.tsx        # Main app entry
```

## 📈 Performance

### Load Times
- Tier 1: 300ms
- Tier 2: 450ms
- Tier 3: 600ms

### Memory
- Base: 50MB
- Health: +10MB
- Privacy: +5MB

### Target
- 60 FPS on mid-range devices
- Only render current tier UI

## 🎯 Future-Proofing

### Scalability
- New tiers: Add to GAME_TIERS
- New features: Add to config
- New integrations: Plug into hooks

### Maintainability
- Single config file
- Domain-driven structure
- TypeScript throughout

### Extensibility
- Swap health systems
- Add data sources
- Plug in blockchains

## 🏆 Summary

**Strengths:**
✅ Clean separation of concerns
✅ Config-driven behavior  
✅ Progressive enhancement
✅ Type-safe throughout
✅ Testable components

**Result:** Maintainable, scalable architecture balancing simplicity with power