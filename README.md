# TimFit — Personal PPL Fitness Tracker

A fully personal Progressive Web App (PWA) for Tim's 6-day Push/Pull/Legs program.

---

## Step 1 — Generate App Icons (one time)

1. Open **`generate-icons.html`** in any desktop browser (double-click it)
2. Click each download button to save the 4 PNG files
3. Move all 4 PNG files into **`assets/icons/`** folder:
   - `icon-192.png`
   - `icon-512.png`
   - `icon-maskable.png`
   - `apple-touch-icon.png`

---

## Step 2 — Deploy to GitHub Pages

### 2a. Create GitHub Account & Repository
1. Go to [github.com](https://github.com) and create a free account (if you don't have one)
2. Click **"New repository"** (green button)
3. Name it: **`timfit`**
4. Set it to **Public**
5. Click **"Create repository"**

### 2b. Upload Files
1. In your new repository, click **"uploading an existing file"**
2. Drag the entire **TimFit** folder contents into the upload area:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `timer-worker.js`
   - `generate-icons.html`
   - `css/` folder (with `main.css`)
   - `js/` folder (with all `.js` files)
   - `assets/` folder (with `icons/` subfolder containing your 4 PNGs + SVG)
3. Scroll down, click **"Commit changes"**

### 2c. Enable GitHub Pages
1. Go to your repository → **Settings** tab
2. Left sidebar → **Pages**
3. Under "Source": select **Deploy from a branch**
4. Branch: **main** | Folder: **/ (root)**
5. Click **Save**
6. Wait 1–2 minutes. GitHub will show your URL: `https://YOUR-USERNAME.github.io/timfit`

---

## Step 3 — Install on iPhone

1. Open **Safari** on your iPhone (must be Safari, not Chrome)
2. Navigate to: `https://YOUR-USERNAME.github.io/timfit`
3. Tap the **Share** button (box with arrow pointing up)
4. Scroll down → tap **"Add to Home Screen"**
5. Name: **TimFit** → tap **Add**
6. The TimFit icon appears on your home screen

---

## Step 4 — First Launch

1. Tap the **TimFit** icon on your home screen
2. The app opens full screen (no browser chrome)
3. You'll be prompted to set a **6-digit PIN** — this protects your data
4. Enter and confirm your PIN
5. You're in — Dashboard loads automatically

---

## Step 5 — Apple Shortcuts for Health Data (Steps / Distance)

To sync your Xiaomi Smart Band 10 step data from Apple Health:

1. Open the **Shortcuts** app on your iPhone
2. Tap **+** to create a new shortcut
3. Name it: **TimFit Health Sync**
4. Add these actions in order:
   - **Get Health Samples** → Steps → Today
   - **Get Health Samples** → Walking + Running Distance → Today
   - **Get Health Samples** → Active Energy Burned → Today
   - **Text** → type this exactly (replace [values] with the action outputs):
     ```
     {"steps": [STEPS VALUE], "distance": [DISTANCE VALUE], "calories": [CALORIES VALUE], "date": "[CURRENT DATE]"}
     ```
   - **Copy to Clipboard** → [Text from previous step]
5. Add the shortcut to your home screen or Today View widget
6. **Daily routine**: Run the shortcut → open TimFit → Progress tab → tap **"Paste Health Data"**

**Pre-requisite**: Enable Mi Fitness → Apple Health sync:
- Open Mi Fitness app → Profile → Health monitoring → Connect Apple Health → enable all metrics

---

## Usage Guide

### Daily Workout Flow
1. Open TimFit (auto-unlocks if within auto-lock window)
2. Dashboard shows today's session (e.g., "Push A — Monday")
3. Tap **"Start Workout"**
4. If Legs A or Legs B: complete the APT warmup circuit first
5. For each exercise:
   - Weights are **pre-filled** from your last session
   - Tap weight or reps to adjust with the picker
   - Tap **"Copy to all sets"** to apply Set 1 values to all sets
   - Tap **✓** to mark each set done → rest timer starts automatically
6. Tap **"Finish Workout"** when done
7. Session summary shows duration, volume, and any PRs

### Rest Timer
- Slides up from bottom after each set
- Timer continues even if you scroll through exercises
- Mini bar at bottom of screen shows remaining time
- Tap mini bar to reopen the sheet
- +15s / -15s buttons to adjust
- Tap **Skip** to dismiss early

### Crash Recovery
- If the app closes mid-workout, the session is saved
- On next open, a banner appears: **"Resume Workout"** or **Discard**

### Progress Photos
- Photos tab → tap **+**
- Choose camera or photo library
- Tag with angle (Front/Back/Left/Right)
- Compare mode: side-by-side slider comparison between any two photos

### Weekly Summary (for Claude.ai analysis)
- Progress tab → scroll to bottom → **"Export Weekly Summary"**
- Tap **"Copy to Clipboard"**
- Paste into Claude.ai: *"Here's my week, please analyze and suggest next week's weights"*

---

## Updating the App

To update TimFit after any changes:
1. Edit the file on GitHub (click the file → pencil icon)
2. Or upload a new version to replace the old file
3. Changes go live within minutes
4. On iPhone: the service worker auto-updates in the background

---

## Exercise GIF Setup

The app is designed to work with or without GIFs (shows emoji placeholder if GIF is missing).

To add real exercise GIFs for visual demonstrations:
1. Download from [WGER Workout Manager](https://github.com/wger-project/wger) (CC licensed) or [Everkinetic](https://github.com/everkinetic/data)
2. Name files exactly as listed below
3. Place in `assets/gifs/` folder

**Required filenames:**
```
incline_barbell_press.gif    flat_bench_press.gif         seated_db_overhead_press.gif
cable_lateral_raise.gif      tricep_bar_pushdown.gif      overhead_tricep_extension.gif
cable_face_pull.gif          weighted_pullup.gif          barbell_bent_over_row.gif
seated_cable_row_neutral.gif ez_bar_curl.gif              hammer_curl.gif
barbell_back_squat.gif       barbell_hip_thrust.gif       leg_press.gif
lying_leg_curl.gif           standing_calf_raise.gif      cable_crunch.gif
incline_db_press.gif         cable_chest_fly.gif          arnold_press.gif
cable_lateral_raise_leaning.gif weighted_dips_chest.gif   skull_crusher.gif
seated_cable_row_wide.gif    cable_rear_delt_fly.gif      incline_db_curl.gif
cable_curl_single_arm.gif    bulgarian_split_squat.gif    hack_squat.gif
db_hip_thrust.gif            back_extension.gif           leg_extension.gif
seated_calf_raise.gif        ab_wheel_rollout.gif
```

---

## Data & Privacy

- **All data stored locally** on your device in `localStorage`
- No servers, no accounts, no tracking
- Only you know the GitHub Pages URL
- **Export backup**: Settings → Export All Data (JSON)
- **Import backup**: Settings → Import Data (JSON)

---

## Technical Details

- Pure Vanilla JS + HTML + CSS (no framework)
- Chart.js (CDN) for progress charts
- Web Worker for background rest timer
- Web Audio API for timer sounds (works with screen locked)
- Web Crypto API (SHA-256) for PIN hashing
- Service Worker for full offline functionality
- navigator.vibrate() for haptic feedback

---

*Built with Claude Code — Anthropic*
