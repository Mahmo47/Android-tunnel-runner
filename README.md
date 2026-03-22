# 🌀 Tunnel Runner 3D  —  SDK 55 Edition

Neon cyberpunk endless-runner for **Android & iOS**.  
Built with **Expo SDK 55 + Expo Router v7 + TypeScript**.

---

## Stack

| Layer | Package | Why |
|---|---|---|
| Framework | `expo@^55` | Latest SDK (Feb 2026), New Architecture only |
| Navigation | `expo-router@^7` | File-based routing, ships with SDK 55 |
| 3D Engine | `three@^0.172` | Latest Three.js — **no expo-three** (it's dead) |
| WebGL | `expo-gl@^55` | Provides native OpenGL-ES context to Three.js |
| Gyroscope | `expo-sensors@^55` | Tilt controls |
| Haptics | `expo-haptics@^55` | Collision + wall warning vibration |
| Storage | `@react-native-async-storage/async-storage@^2` | High score + settings |

> **`expo-three` is NOT used.** It's unmaintained and incompatible with SDK 55.  
> Instead, `THREE.WebGLRenderer` is initialised directly with a canvas shim that  
> wraps the `expo-gl` context. See `app/game.tsx → makeCanvasShim()`.

---

## Setup

```bash
# Node 20 or 22 LTS required (Node 24 is NOT supported by SDK 55)
node --version   # v20.x or v22.x

npm install
npx expo start --clear
```

Scan the QR with **Expo Go** on a physical device.  
Gyroscope does **not** work on simulators/emulators.

---

## File structure

```
app/
  _layout.tsx   Expo Router v7 stack (fade / slide transitions)
  index.tsx     Main menu
  game.tsx      3D game — Three.js + gyro + haptics
  gameover.tsx  Results — grade, score, personal best
  settings.tsx  Sensitivity, difficulty, haptics, reset
metro.config.js  unstable_enablePackageExports=false (required for Three.js)
```

---

## Key implementation notes

### Three.js without expo-three

```ts
// makeCanvasShim — fakes an HTMLCanvasElement for THREE.WebGLRenderer
const renderer = new THREE.WebGLRenderer({
  canvas: makeCanvasShim(gl),   // width/height/getContext shim
  context: gl,                   // real native WebGL context from expo-gl
  antialias: false,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(1);      // always 1 — expo-gl handles DPR natively
// After each frame:
gl.endFrameEXP();               // commits the frame to the screen
```

### Gyroscope

```ts
Gyroscope.setUpdateInterval(16);   // ~60 fps
Gyroscope.addListener(d => { gyroData.current = d; });
// In the game tick:
px.x = clamp(px.x - gyro.y * sensitivity * dt, -MAX, MAX);
px.y = clamp(px.y - gyro.x * sensitivity * dt, -MAX, MAX);
```

### Haptics

```ts
// Wall proximity warning
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
// Ring collision
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
// Game over (all lives gone)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
// New high score on results screen
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
```

---

## Tunable constants (`app/game.tsx`)

```ts
const INITIAL_SPEED    = 0.055;  // base forward speed
const OBSTACLE_SPACING = 11;     // units between rings
const INVINCIBLE_MS    = 2200;   // shield after hit (ms)
const WALL_WARN_FRAC   = 0.88;   // fraction of radius that triggers warning haptic
```

Difficulty modifiers:

```ts
const DIFF = {
  easy:   { gap: Math.PI * 0.56, maxSpd: 0.22 },
  normal: { gap: Math.PI * 0.48, maxSpd: 0.32 },
  hard:   { gap: Math.PI * 0.38, maxSpd: 0.42 },
};
```