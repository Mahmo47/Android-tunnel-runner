# 🌀 Tunnel Runner 3D

Neon cyberpunk endless-runner for **Android & iOS**.
Built with **Expo SDK 54 + Expo Router v6 + TypeScript (strict)**.

---

## Stack

| Layer | Package | Why |
|---|---|---|
| Framework | `expo@^54` | Managed Workflow, Expo Go kompatibel |
| Navigation | `expo-router@~6` | File-based routing |
| 3D Engine | `three@0.128` via CDN in WebView | expo-gl/expo-three inkompatibel mit SDK 54 |
| Gyroscope | `expo-sensors` | Tilt controls (16ms Intervall) |
| Haptics | `expo-haptics` | Kollision + Wall Warning Vibration |
| Storage | `@react-native-async-storage/async-storage` | Highscore + Settings |

> **Three.js läuft in einer WebView**, nicht über expo-gl.
> Der HTML-String wird in `buildGameHTML()` generiert und per CDN geladen.

---

## Setup

```bash
npm install
npx expo start --clear
```

Scan the QR with **Expo Go** on a physical device.
Gyroscope does **not** work on simulators/emulators.

---

## File structure

```
app/
  _layout.tsx     Stack Navigator (fade / slide transitions)
  index.tsx       Main menu + highscore
  game.tsx        3D game — Three.js WebView + gyro + haptics + HUD
  gameover.tsx    Results — grade, score, personal best
  settings.tsx    Sensitivity, difficulty, haptics, reset
.prettierrc       Formatter config
eas.json          EAS Build profiles (dev/preview/production)
metro.config.js   .cjs support + enablePackageExports=false
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
