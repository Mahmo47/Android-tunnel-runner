# Projekt- & Architekturdokumentation

**Tunnel Runner 3D** │ 
Modul: Mobile Anwendungen – SoSe 2026 │ 
Betreuer: Prof. Dr. Olaf Grebner │ 
Team: Mahmud Das (D867) & Alexander Savkov (D911) │
Version: 1.0.0
---
# 1 Anforderungen & Ziele

## 1.1 Themensteckbrief

| Feld                | Inhalt                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Projektname**     | **Tunnel Runner 3D**                                                                                           |
| **Paketname**       | `com.yourname.tunnelrunner3d` (Android) · npm: `tunnel-runner-3d`                                              |
| **Plattform**       | Android (primär), iOS (vorbereitet)                                                                            |
| **Framework**       | React Native 0.81.5 + Expo SDK 54 (Managed Workflow)                                                           |
| **Teamgröße**       | 2 Entwickler                                                                                                   |
| **Zeitbudget**      | 80 Stunden gesamt                                                                    |

### Problemstellung

Mobile Spiele im Endless-Runner-Genre setzen fast ausschließlich auf Touch-Steuerung (Wischen, Tippen). Das ist auf Dauer monoton und nutzt die Sensor-Hardware moderner Smartphones nicht aus. **Tunnel Runner 3D** löst dieses Problem, indem es die Steuerung vollständig auf das **Gyroskop** verlagert: Der Spieler navigiert eine leuchtende Kugel durch einen prozedural generierten 3D-Neon-Tunnel, indem er das Gerät physisch neigt. Dadurch entsteht ein immersives, körperliches Spielerlebnis, das sich deutlich von herkömmlichen Touch-Runnern abhebt.

### Zielgruppe

- **Casual Gamer** (16–35 Jahre), die kurze, intensive Spielsessions auf dem Smartphone suchen.
- **Retro- / Arcade-Fans**, die ein visuell ansprechendes Neon-Cyberpunk-Erlebnis mit steigendem Schwierigkeitsgrad schätzen.
- **Technik-affine Nutzer**, die Sensor-basierte Steuerung (Gyroskop + Haptik) gegenüber klassischen Touch-Controls bevorzugen.

### Kernfunktionalität (MVP – Alleinstellungsmerkmal)

Das Minimum Viable Product basiert auf drei Säulen:

1. **3D-Tunnel mit Hindernissen:** Ein endloser, prozedural generierter Tunnel mit Hindernis-Ringen, die jeweils eine zufällig platzierte Lücke besitzen. Durch Object-Pooling entsteht kein Speicher-Overhead bei unendlicher Laufzeit.
2. **Gyroskop-Steuerung:** Die Neigung des Geräts steuert die Spielerposition in Echtzeit. Die Sensitivität ist in vier Stufen konfigurierbar.
3. **Haptisches Feedback:** Drei abgestufte Vibrationsmuster (Wandnähe, Kollision, Game Over) geben dem Spieler physisches Feedback über seinen Spielzustand. Die Haptik ist abschaltbar.
4. 
---

## 1.2 Funktionale Anforderungen (Details)

### Muss-Kriterien

| ID   | Anforderung                                 | Beschreibung                                                                                                                          |
| ---- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | 3D-Tunnel-Rendering                         | Prozedural generierter Neon-Tunnel via Three.js, gerendert in einem Vollbild-WebView. Tunnel-Segmente werden endlos recycelt.          |
| F-02 | Hindernis-System                            | Hindernis-Ringe mit zufälliger Lückenposition. Lückenbreite variiert je nach gewähltem Schwierigkeitsgrad.                             |
| F-03 | Gyroskop-Steuerung                          | Echtzeitauswertung des Gyroskops mit konfigurierbarer Sensitivität. Neigung wird direkt auf die Spielerposition übertragen.            |
| F-04 | Kollisionserkennung                         | Kombination aus Distanz- und Winkel-Check gegen alle aktiven Hindernis-Ringe in der Nähe des Spielers.                                |
| F-05 | Leben-System                                | 3 Leben pro Spiel mit kurzer Unverwundbarkeits-Phase nach jeder Kollision. Bei 0 Leben endet das Spiel automatisch.                   |
| F-06 | Score-System mit Echtzeit-HUD               | Fortlaufender Score basierend auf zurückgelegter Distanz. HUD zeigt Score und aktuelle Geschwindigkeitsstufe (1–6).                    |
| F-07 | Haptisches Feedback                         | Drei Vibrationsstufen (Wandnähe, Kollision, Tod/Highscore). Über Settings global abschaltbar.                                         |
| F-08 | Screen-Navigation                           | Vier Screens (Menü, Spiel, Game Over, Settings) mit File-based Routing und screen-spezifischen Übergangsanimationen.                   |
| F-09 | Highscore-Persistenz                        | Lokale Speicherung des persönlichen Bestscores. Anzeige im Hauptmenü und auf dem Game-Over-Screen.                                     |
| F-10 | Settings                                    | Konfigurierbare Gyro-Sensitivität (4 Stufen), Schwierigkeitsgrad (3 Stufen), Haptics-Toggle und vollständiger Reset.                   |
| F-11 | Pause / Quit                                | Pause-Funktion während des Spiels. Quit mit Bestätigungs-Dialog, bei dem der aktuelle Spielstand verworfen wird.                       |
| F-12 | Grade-System                                | Buchstaben-Bewertung (S/A/B/C/D) auf dem Game-Over-Screen, basierend auf dem erreichten Score.                                         |

### Soll-Kriterien (geplant, perspektivisch)

| ID   | Feature                         | Perspektive                                                                                                                                       |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| S-01 | Coin-System mit Sammelobjekten  | Nicht im aktuellen Release enthalten – erfordert eigene Kollisionslogik, Partikeleffekte und Belohnungssystem. Perspektivisch Grundlage für ein Upgrade- und Freischalt-Modell. |
| S-02 | Erweiterte Hindernistypen       | Aktuell nur ein Typ (Ring mit Lücke). Geplant: rotierende Ringe, Wände, sich verengende Segmente. Voraussetzung: validiertes Balancing der Basismechanik. |
| S-03 | Power-Ups / Items               | Baut auf S-01 auf. Sobald ein Coin-System existiert, folgen sammelbare Items (Schild, Zeitlupe, Magnet) als Belohnungsmechanik.                    |
| S-04 | Wechselnde Tunnel-Abschnitte    | Farbwechsel, Texturvarianten und Umgebungswechsel sind vorgesehen. Zurückgestellt zugunsten einer stabilen Performance-Basis.                       |
| S-05 | Soundtrack & Soundeffekte       | Geplant: dynamischer Soundtrack, angepasst an die Geschwindigkeitsstufe, plus SFX für Kollisionen. Erfordert `expo-av`-Integration in einem kommenden Sprint. |

### Abgrenzung (explizit nicht umgesetzt)

| ID   | Feature                       | Begründung                                                                                                              |
| ---- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A-01 | Mehrspieler / Online-Modus    | Ein Server-Backend hätte den Scope eines 40h-Projekts gesprengt. Der Fokus lag bewusst auf einer offline-fähigen App.    |
| A-02 | iOS-Veröffentlichung          | Ohne Apple Developer Account (99 $/Jahr) ist kein App-Store-Release möglich. Die Codebase ist aber iOS-kompatibel.       |
| A-03 | Cloud-Sync / User-Auth        | Authentifizierung und Datensynchronisation hätten ein MBaaS (Firebase o. Ä.) erfordert – unverhältnismäßig für ein Spiel mit rein lokalen Daten. |
| A-04 | Leaderboard / Social Features | Globale Ranglisten setzen A-01 und A-03 voraus. Ohne Backend kein sinnvolles Leaderboard.                                |

---

## 1.3 Nicht-funktionale Anforderungen & Qualitätsziele

| NFR-ID | Kategorie                      | Anforderung                                                                                                                                                         |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NF-01  | **Usability**                  | Die App muss ohne Tutorial sofort spielbar sein. Die Steuerung erfolgt intuitiv durch Neigen des Geräts, keine Buttons während des Spiels. Eine „HOW TO PLAY"-Karte im Menü reicht als Erklärung. |
| NF-02  | **Visuelles Design**           | Konsistentes Neon-Cyberpunk-Theme über alle Screens hinweg (Dark Mode, einheitliche Farbpalette).                                  |
| NF-03  | **Performance**                | Stabile 60 FPS im Game Loop durch `requestAnimationFrame` mit Delta-Time-Normalisierung und begrenzter Pixel-Ratio. Architektur-Details → **Kapitel 3.4**.           |
| NF-04  | **Plattform-Kompatibilität**   | Primär Android. iOS-spezifische Anpassungen (Padding, Gyro-Permission) sind im Code berücksichtigt, sodass ein späterer iOS-Release ohne Code-Änderungen möglich wäre. |
| NF-05  | **Typsicherheit**              | TypeScript im Strict Mode mit typisierten Interfaces für alle Datenstrukturen. Details → **Kapitel 4.4**.                                                             |
| NF-06  | **Orientierung**               | Ausschließlich Portrait-Modus, da die Gyroskop-Achsenzuordnung (Neigen = Steuern) nur in einer festen Orientierung konsistent funktioniert.                          |
| NF-07  | **Barrierefreiheit (Haptik)**  | Haptisches Feedback ist vollständig abschaltbar, um Nutzer mit Sensibilitäten oder in ruhigen Umgebungen nicht einzuschränken.                                        |
| NF-08  | **Datensparsamkeit**           | Keine Netzwerk-Requests, keine Analytics, keine Tracker. Einzige externe Abhängigkeit zur Laufzeit ist das Three.js-CDN. Nur zwei lokale Schlüssel werden persistiert. |
| NF-09  | **Startzeit**                  | Sofortige Splash-Screen-Anzeige ohne asynchrones Asset-Loading, um die wahrgenommene Startzeit zu minimieren.                                                         |
| NF-10  | **Fehlertoleranz**             | Alle optionalen Hardware-Zugriffe (Haptics) sind mit Fallbacks abgesichert. Korrupte Settings werden durch Defaults ersetzt.                                          |

---

## 2 Tech Stack

### 2.1 Tech Stack Canvas

| Schicht | Technologie | Version | Zweck |
|---|---|---|---|
| **Framework** | Expo (Managed Workflow) | ^54.0.33 | App-Plattform, Build-System |
| **Sprache** | TypeScript | ~5.9.2 | Typsicherheit, Strict Mode |
| **UI-Framework** | React Native | 0.81.5 | Native UI-Komponenten |
| **Navigation** | expo-router | ~6.0.23 | File-based Routing |
| **3D-Engine** | Three.js (via WebView) | ^0.166.0 | 3D-Rendering des Tunnels |
| **WebView** | react-native-webview | 13.15.0 | Host für Three.js Game Loop |
| **Gyroskop** | expo-sensors | ~15.0.8 | Neigungssteuerung |
| **Haptik** | expo-haptics | ~15.0.8 | Vibrationsfeedback |
| **Persistenz** | AsyncStorage | 2.2.0 | Highscore & Settings |
| **Persistenz** | expo-secure-store | ~15.0.8 | Settings (alternative Nutzung) |
| **Splash** | expo-splash-screen | ~31.0.13 | Ladebildschirm |
| **Bundler** | Metro (Expo) | via `@expo/metro-runtime` | JS-Bundling |
| **Typen** | @types/react, @types/three | ~19.1.10, ^0.153.0 | TypeScript-Definitionen |

### 2.2 Architektur-Entscheidungen

<!-- TODO: Warum WebView statt expo-gl direkt? Warum kein expo-three? -->
<!-- Hinweis aus dem Code: "expo-three is NOT used. It's unmaintained and incompatible with SDK 55." -->
<!-- Stattdessen: Three.js läuft in einem WebView; Gyro-Daten werden per `injectJavaScript()` eingespeist. -->

---

## 3 Frontend: Struktur & Bausteine

### 3.1 Wesentliche Komponenten

```
app/
├── _layout.tsx      → RootLayout (Expo Router Stack, Splash Screen)
├── index.tsx        �� MenuScreen (Hauptmenü, Highscore-Anzeige)
├── game.tsx         → GameScreen (3D-Spiel: WebView + HUD + Haptics)
├── gameover.tsx     → GameOverScreen (Score, Grade, Personal Best)
├── settings.tsx     → SettingsScreen (Sensitivity, Difficulty, Haptics, Reset)
metro.config.js      → Metro-Konfiguration (Three.js Kompatibilität)
app.json             → Expo-Konfiguration (Permissions, Plugins, Scheme)
tsconfig.json        → TypeScript Strict Mode + Pfad-Aliase
package.json         → Dependencies & Scripts
PLANUNG              → Interne Aufgabenverteilung
```

### 3.2 Komponenten-Details & Interaktion

| Komponente | Datei | Hauptverantwortung |
|---|---|---|
| `RootLayout` | `app/_layout.tsx` | Stack-Navigation, Splash Screen, StatusBar |
| `MenuScreen` | `app/index.tsx` | Hauptmenü, Highscore laden, Navigation zu Game/Settings |
| `GameScreen` | `app/game.tsx` | WebView mit Three.js, Gyro-Injection, HUD, Lives, Pause |
| `GameOverScreen` | `app/gameover.tsx` | Score-Bewertung (Grade S–D), Highscore-Update, Animationen |
| `SettingsScreen` | `app/settings.tsx` | Gyro-Sensitivity, Difficulty, Haptics-Toggle, Reset |
| `buildGameHTML()` | `app/game.tsx` | Generiert HTML/JS-String mit Three.js Game Loop |

### 3.3 UI-Komponenten-Aufbau

<!-- TODO: Beschreibe den visuellen Aufbau der Screens (Neon Cyberpunk Design, Dark Theme) -->
<!-- Hinweis: Farbschema #000011 (Hintergrund), #00ffff (Akzent/Cyan), #ff2244 (Game Over), #ffaa00 (Highscore) -->

### 3.4 Bausteinsicht: `GameScreen`

<!-- TODO: Detaillierte Darstellung des Aufbaus von game.tsx -->
<!-- Schichten: 
     1. Settings laden (SecureStore) → buildGameHTML() 
     2. WebView rendert Three.js 
     3. Gyroscope → injectJavaScript → window._gyro
     4. WebView postMessage → handleMessage() → Score/Collision/WallWarn
     5. Native HUD (Score, Speed Bars, Lives, Pause/Quit Buttons)
     6. Haptics-Layer (Light/Heavy/Notification)
-->

### 3.5 Komponenten-Interaktion

<!-- TODO: Sequenzdiagramm oder Beschreibung des Datenflusses -->
<!-- MenuScreen → router.push('/game') → GameScreen → router.replace('/gameover', {score}) → GameOverScreen -->
<!-- SettingsScreen speichert in AsyncStorage; GameScreen liest beim Mount -->

### 3.6 Modularisierung

| Concern | Datei(en) | Beschreibung |
|---|---|---|
| Navigation | `_layout.tsx` | Stack mit Screen-spezifischen Animationen |
| Game Engine | `game.tsx` → `buildGameHTML()` | Gesamte 3D-Logik als HTML-String |
| Settings-Typen | `settings.tsx` → `GameSettings`, `DEFAULT_SETTINGS` | Exportierte Typen & Konstanten |
| Highscore-Key | `index.tsx` → `HS_KEY` | Exportiert für Wiederverwendung in `gameover.tsx` |
| Metro-Config | `metro.config.js` | `unstable_enablePackageExports = false` für Three.js |

### 3.7 State Management

<!-- TODO: Beschreibe die State-Strategie -->
<!-- Kein globaler State Manager (Redux/Zustand). Stattdessen:
     - React useState/useRef pro Screen
     - useRef für Performance-kritische Werte (livesRef, gsRef, scoreRef)
     - Settings: AsyncStorage (persistent) + settingsRef (in-memory für Game Loop)
     - WebView-State: window._gyro, window._paused (injected via JS)
-->

### 3.8 Routing

| Route | Screen | Animation | Beschreibung |
|---|---|---|---|
| `/` (index) | `MenuScreen` | `fade` (default) | Hauptmenü |
| `/game` | `GameScreen` | `none` | 3D-Spielbildschirm |
| `/gameover` | `GameOverScreen` | `slide_from_bottom` | Ergebnisscreen |
| `/settings` | `SettingsScreen` | `slide_from_right` | Einstellungen |

Routing-Library: `expo-router` ~6.0.23 (File-based Routing)
Navigation: `router.push()`, `router.replace()`, `router.back()`

### 3.9 Persistenz

| Daten | Storage | Key | Lesen | Schreiben |
|---|---|---|---|---|
| Highscore | AsyncStorage | `tunnel_highscore_v3` | `index.tsx`, `gameover.tsx` | `gameover.tsx` |
| Settings | AsyncStorage | `tunnel_settings_v3` | `settings.tsx`, `game.tsx` | `settings.tsx` |
| Settings (alt.) | SecureStore | `tunnel_settings_v3` | `game.tsx` (Settings-Load) | – |

### 3.10 Konfiguration

| Konfigurationsdatei | Wesentliche Einstellungen |
|---|---|
| `app.json` | Name, Orientation (portrait), Scheme (tunnelrunner://), Dark Mode, Android VIBRATE Permission, Gyroscope motionPermission, Plugins |
| `tsconfig.json` | Strict Mode, Pfad-Aliase `@/*` |
| `metro.config.js` | `.cjs` Extension Support, `unstable_enablePackageExports: false` |
| `package.json` | Entry Point: `expo-router/entry` |

### 3.11 Implementierung der Fachlogik

<!-- TODO: Beschreibe die Kern-Spiellogik -->
<!-- Spielmechaniken in buildGameHTML():
     - Tunnel: 3 recycelte CylinderGeometry-Segmente (je 90 Einheiten lang)
     - Hindernisse: 18 Ringe mit zufälliger Lücke (gapAngle je nach Difficulty)
     - Kollision: Distanz-Check (px,py) + Winkel-Check gegen gapAngle
     - Speed: INITIAL_SPEED + score * speedScale, gedeckelt durch maxSpeed
     - Difficulty-Stufen: easy/normal/hard (Gap-Winkel + Max-Speed)
     - Lives: 3 Leben, Invincibility 2200ms nach Treffer
     - Wall Warning: Haptic bei > 88% des max. Offsets
-->

---

## 4 Tooling

### 4.1 Scripts in `package.json`

| Script | Befehl | Beschreibung |
|---|---|---|
| `start` | `expo start` | Dev Server starten (QR-Code für Expo Go) |
| `start:clear` | `expo start --clear` | Dev Server mit Cache-Clear |
| `android` | `expo start --android` | Direkt auf Android-Emulator/Device starten |
| `ios` | `expo start --ios` | Direkt auf iOS-Simulator starten |

### 4.2 Package Management

| Aspekt | Wert |
|---|---|
| Package Manager | **npm** |
| Lock-Datei | `package-lock.json` |
| Dependencies (prod) | 23 |
| Dependencies (dev) | 4 |
| Privat | `true` (nicht veröffentlichbar) |

### 4.3 Linter & Formatter

<!-- TODO: Beschreibe den Stand -->
<!-- Aktueller Stand: Kein ESLint, kein Prettier, kein JSDoc-Enforcement konfiguriert.
     Empfehlung: eslint-config-expo + prettier + require-jsdoc Rule -->

### 4.4 TypeScript-Konfiguration

| Option | Wert | Auswirkung |
|---|---|---|
| `extends` | `expo/tsconfig.base` | Expo-Standard-Einstellungen |
| `strict` | `true` | Strikte Typisierung |
| `paths` | `@/* → ./*` | Saubere Import-Pfade |
| `include` | `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.d.ts` | Alle TS/TSX-Dateien |

### 4.5 Dev Build

<!-- TODO: Beschreibe den Entwicklungs-Workflow -->
<!-- `npm start` → Metro Bundler → Expo Go App auf physischem Gerät (QR-Code scannen) -->
<!-- Gyroskop funktioniert NICHT im Emulator → physisches Device erforderlich -->

### 4.6 Production Build

<!-- TODO: Beschreibe den Prod-Build-Prozess -->
<!-- `eas build --platform android` (Expo Application Services) -->
<!-- Aktuell: Kein EAS-Config im Repo vorhanden -->

### 4.7 Deployment

<!-- TODO: Beschreibe die Deployment-Strategie -->
<!-- Aktuell: Nur lokale Entwicklung via Expo Go -->
<!-- Kein App Store / Play Store Release konfiguriert -->

---

## 5 Qualität

### 5.1 Test-Setup

<!-- TODO: Beschreibe vorhandene Tests -->
<!-- Aktueller Stand: Keine Unit-Tests, keine E2E-Tests im Repository vorhanden.
     Kein Jest-Config, kein Detox/Maestro Setup.
     Empfehlung: Jest + React Native Testing Library für Komponentenlogik -->

### 5.2 CI/CD-Pipeline

<!-- TODO: Beschreibe die CI/CD-Pipeline -->
<!-- Aktueller Stand: Kein `.github/workflows/`-Verzeichnis vorhanden.
     Keine GitHub Actions konfiguriert.
     Empfehlung: Lint + Type-Check + Build Workflow -->

---

## 6 Quellcode-Übersicht

### Dateistruktur & Kennzahlen

| Datei | Typ | Zeilen (ca.) | Beschreibung |
|---|---|---|---|
| `app/_layout.tsx` | TSX | ~30 | Root Layout mit Stack-Navigation |
| `app/index.tsx` | TSX | ~140 | Hauptmenü mit Animationen |
| `app/game.tsx` | TSX | ~557 | Spiellogik (WebView + Native HUD) |
| `app/gameover.tsx` | TSX | ~173 | Game-Over-Screen mit Grading |
| `app/settings.tsx` | TSX | ~223 | Einstellungs-Screen |
| `metro.config.js` | JS | ~9 | Metro-Bundler-Konfiguration |
| `app.json` | JSON | ~38 | Expo-App-Konfiguration |
| `package.json` | JSON | ~44 | Dependencies & Scripts |
| `tsconfig.json` | JSON | ~16 | TypeScript-Konfiguration |
| `PLANUNG` | Text | ~14 | Aufgabenverteilung |

| Kennzahl | Wert |
|---|---|
| **Gesamte Quelldateien (app/)** | 5 TSX-Dateien |
| **Geschätzter TS/TSX-Code** | ~1.120 Zeilen |
| **Commits (master)** | 9 |
| **Branches** | 4 (`master`, `main`, `Dev`, `dev`) |
| **Contributers** | 2 (Mahmo47, Alex) |
| **Zeitraum** | 04.02.2026 – 22.03.2026 |

---

## 7 Projektbericht

### 7.1 Kapazitätsplan (Plan vs. Ist)

| Arbeitspaket | Verantwortlich | Plan (h) | Ist (h) | Abweichung |
|---|---|---|---|---|
| Projektsetup & Expo Init | Mahmud | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| 3D-Tunnel-Rendering (Three.js) | Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Gyroskop-Steuerung | Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Kollisionserkennung & Lives | Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| HUD & Game-Over-Screen | Mahmud | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Settings-Screen | Mahmud & Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Haptics & Vibration | Mahmud | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Highscore-Persistenz | Mahmud & Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Coin-System | Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Soundtrack & SFX | Mahmud | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| Dokumentation & Präsentation | Mahmud & Alex | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| **Summe** | | **40** | <!-- TODO --> | <!-- TODO --> |

### 7.2 Lessons Learned

**1. WebView-Architektur als Workaround für `expo-three`-Inkompatibilität**
<!-- TODO: Ausformulieren -->
<!-- Das ursprüngliche Setup nutzte @react-three/fiber + expo-three direkt.
     Diese Libraries waren inkompatibel mit Expo SDK 54/55.
     Die Migration zu einem WebView-basierten Ansatz (Three.js via CDN im HTML-String)
     war aufwändig, ermöglichte aber den Betrieb in Expo Go ohne nativen Build.
     Lesson: Vor Projektstart Kompatibilität aller Core-Dependencies prüfen. -->

**2. Inkonsistente Dependency-Versionen zwischen Branches**
<!-- TODO: Ausformulieren -->
<!-- Im dev-Branch wurden SDK-55-Versionen genutzt, auf master mussten diese
     zurück auf SDK-54-kompatible Versionen gedowngraded werden (Commit b962a69).
     Das führte zu einem großen package-lock.json Diff und Zeitverlust.
     Lesson: Dependency-Upgrades nur in einem dedizierten Branch durchführen,
     nach erfolgreichem Build mergen. -->

**3. Fehlender Game-Over-Screen als kritischer Bug kurz vor Deadline**
<!-- TODO: Ausformulieren -->
<!-- Der letzte Commit (b962a69) hieß "Fixed version fehlender gameover" –
     ein essentielles Feature (F-03) funktionierte bis kurz vor Abgabe nicht korrekt,
     weil die Dependency-Versionen im package.json nicht zum Code passten.
     Lesson: Feature-Vollständigkeit frühzeitig auf einem stabilen Branch sicherstellen;
     Version-Pinning statt Semver-Ranges für kritische Packages. -->

---
