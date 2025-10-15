# Character Runner

A fast, minimal browser game where you dodge obstacles and survive as long as possible. It supports keyboard, on-screen buttons, and drag controls. You can plug in your own character image.

> Language: English + Urdu/Hinglish steps for easy posting on GitHub.

---

## Demo (Local)
- Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
- Or serve via any static server (e.g., VS Code Live Server).

---

## Run for Everyone (No Dev Tools)
Simple steps so anyone can run the game — even without coding tools.

### Windows
1. Download or copy the folder `character-runner-game/` to your PC.
2. (Optional) Put your own image at `assets/character.png`.
3. Double-click `index.html` to open it in your default browser.
4. Play! Use Arrow keys/WASD or drag on the canvas.

### macOS
1. Copy the `character-runner-game/` folder to your Mac.
2. Optional: Add `assets/character.png`.
3. Right-click `index.html` → Open With → Safari/Chrome.

### Linux (Ubuntu, etc.)
1. Save `character-runner-game/` anywhere.
2. Optional: Add `assets/character.png`.
3. Double-click `index.html` or open it with your browser.

### Android (Phone/Tablet)
Option A (quickest):
- Upload the folder to any static hosting (e.g., GitHub Pages) and open the link on your phone.

Option B (offline):
1. Copy the whole `character-runner-game/` folder to your phone storage.
2. Use a local server app (e.g., "Simple HTTP Server" from Play Store).
3. Start the server at that folder and open the shown URL in Chrome.

### iPhone/iPad (iOS)
Option A (recommended):
- Open the game via a hosted link (e.g., GitHub Pages). Safari will run it instantly.

Option B (Files app + local server):
- Use a local server app (e.g., "Kiosk"/"Local Web Server") to serve the folder, then open the URL in Safari.

### If double‑click doesn’t open the game
- Right-click `index.html` → Open With → choose a browser.
- Or use a lightweight server:
  - VS Code: install Live Server → right-click `index.html` → "Open with Live Server".
  - Node (if installed): `npx serve .` and open the printed link.

### Troubleshooting
- Blank page: Ensure all files stayed in the same folder and you opened `index.html`.
- Character not showing: place a PNG at `assets/character.png`. Otherwise a fallback blob appears.
- Lag on mobile: Close other tabs/apps. The game targets 60 FPS but may reduce on older devices.

## Features
- Smooth 2D canvas gameplay (60 FPS target)
- Mobile-friendly drag controls + on-screen buttons
- Keyboard controls (WASD / Arrow Keys)
- Auto difficulty ramp, score, and best score (localStorage)
- Custom character sprite: drop a PNG as `assets/character.png`

---

## Folder Structure
```
character-runner-game/
├─ index.html
├─ style.css
├─ main.js
└─ assets/
   └─ character.png   # your character image (optional)
```

---

## Controls
- Keyboard: Arrow Keys or W A S D
- Touch/Mouse: Press and drag on the canvas
- UI Buttons: ⟵ ⟰ ⟱ ⟶

Goal: Avoid red blocks, survive longer, score higher.

---

## Quick Start (Urdu/Hinglish)
1) Iss folder ko GitHub par push karein.
2) `assets/` ke andar apni image ko `character.png` naam se rakhein.
3) `index.html` par double-click karke game chala dein.

Agar image nahi milegi to fallback blob draw ho jayega.

---

## Use Your Character Image
- Recommended: Transparent PNG, ~256×256
- Path must be exactly: `assets/character.png`
- Change size by editing `player.r` in `main.js`

---

## Local Development
- Open with Live Server (VS Code): Right click `index.html` → "Open with Live Server"
- Or use Node static server (optional):
  ```bash
  npx serve .
  # then open the printed URL
  ```

---

## Customize Gameplay
- `main.js`
  - Difficulty: `spawnObstacle()` → tweak `base` (spawn rate) and obstacle `speed`
  - Player speed: `player.speed`, `player.maxSpeed`, `player.thrust`, `player.friction`
  - Player size: `player.r`
  - Particles: `burst()` and `updateParticles()`

---

## Deploy on GitHub Pages (Step-by-step)
1) Create a new public repo on GitHub. Example: `character-runner-game`.
2) Add all files and push:
   ```bash
   git init
   git add .
   git commit -m "feat: initial game"
   git branch -M main
   git remote add origin https://github.com/<your-username>/character-runner-game.git
   git push -u origin main
   ```
3) On GitHub → Settings → Pages → Build and deployment
   - Source: "Deploy from a branch"
   - Branch: `main` / folder: `/root` → Save
4) After a few minutes, your game will be live at:
   `https://<your-username>.github.io/character-runner-game/`

Tip: If you use a subfolder in a bigger repo, set Pages to that folder, or move these files to repo root.

---

## Screenshots (Optional)
Add screenshots/GIFs here:
```
![Gameplay](docs/screenshot-1.png)
![Game Over](docs/screenshot-2.png)
```

---

## Tech
- Vanilla HTML5 + CSS3
- JavaScript (Canvas 2D)
- No build step required

---

## License
MIT — free to use and modify. Attribution appreciated.

---

## Credits
- Game code and design: You + Cascade assistant
- Character art: Your uploaded `assets/character.png` image

---

## Publishing large files (files > 100 MB)

If some files in your project are larger than GitHub's 100 MB single-file limit (for example a big game build, large sprites or packaged binaries), here are safe ways to publish them.

### Option A — Recommended: Git LFS (store large files in Git while keeping repo small)
1. Install Git LFS for Windows (one-time):

```powershell
# Using scoop (if installed) or download from https://git-lfs.github.com/
scoop install git-lfs  # optional
# Or manually download and run the installer from the site
```

2. Initialize Git LFS in your repo (run once per machine):

```powershell
git lfs install
```

3. Track the types of large files (or use the included `.gitattributes`):

```powershell
# Example: track everything under assets/ (already has .gitattributes in repo)
git lfs track "assets/*"
git add .gitattributes
git add assets/*
git commit -m "chore: add git lfs tracking for large assets"
git push origin main
```

Notes:
- GitHub provides a small amount of free Git LFS storage/bandwidth. Large or frequent uploads may require purchasing additional data packs — check your repository billing settings on GitHub.
- LFS stores pointers in the Git repo; the actual file content is in the LFS store. Cloning the repo will download LFS files automatically.

### Option B — GitHub Releases (best for distributing compiled builds / large binaries)
1. Build or zip your release artifact locally (e.g., `character-runner-game-win.zip`).
2. Open your GitHub repo in a browser → click "Releases" → "Draft a new release".
3. Fill tag/version and description, then drag-and-drop the artifact (file can be larger than 100 MB here).
4. Publish the release — users can download the binary directly without cloning the repo.

Advantages: clean separation between source and large binaries, no Git LFS billing if you only attach release assets (but Releases do have storage limits; check GitHub docs).

### Option C — External hosting (itch.io / S3 / Google Drive / OneDrive)
- itch.io — great for game builds and discoverability (free to upload large files for game distribution).
- AWS S3 / Google Cloud Storage — robust and scalable; adds cost but gives full control.
- Google Drive / OneDrive — quick sharing, but better for small teams or private distribution.

### Quick advice
- For web games (HTML/CSS/JS) that run in a browser, prefer GitHub Pages for the source files and use Releases or external hosting only for packaged desktop builds.
- If you want, I can:
   - Add a short release-ready zip script to package the game, or
   - Create a small `publish.md` in the repo with screenshots and recommended release names.
