# Arch Linux Solution for Running ChanDesk

## The Issue
Tauri apps need a display server (X11 or Wayland). Your headless server has neither running, causing:
```
Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display.
```

## ✅ Solution for Arch Linux

### Step 1: Install Xvfb (Virtual Display)

```bash
sudo pacman -S xorg-server-xvfb
```

### Step 2: Run Your App with Xvfb

```bash
# Run Tauri app with virtual display
xvfb-run -a npm run tauri:dev
```

The `-a` flag automatically picks an available display number.

### Step 3: Alternative - Force X11 Backend

If you still have issues, force GTK to use X11 instead of Wayland:

```bash
# Set environment variable to use X11
GDK_BACKEND=x11 xvfb-run -a npm run tauri:dev
```

## Permanent Solution

Add this to your `package.json` scripts:

```json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:dev:headless": "xvfb-run -a tauri dev",
    "tauri:build": "tauri build"
  }
}
```

Then run:
```bash
npm run tauri:dev:headless
```

## What Each Component Does

- **xorg-server-xvfb**: Virtual X11 display server (no physical monitor needed)
- **xvfb-run**: Wrapper that starts Xvfb automatically and runs your command
- **-a**: Auto-select display number (avoids conflicts)
- **GDK_BACKEND=x11**: Forces GTK apps to use X11 instead of Wayland

## Alternative: Use Wayland Compositor

If you prefer Wayland, install a headless Wayland compositor:

```bash
# Install weston (Wayland reference compositor)
sudo pacman -S weston

# Run with weston
weston --backend=headless-backend.so &
WAYLAND_DISPLAY=wayland-0 npm run tauri:dev
```

## Testing After Installation

```bash
# Install xvfb
sudo pacman -S xorg-server-xvfb

# Test your app
xvfb-run -a npm run tauri:dev

# App will run without display errors!
```

The app won't show a window (headless), but it will run without errors and you can test backend functionality.

---

**TL;DR:** On Arch Linux, run `sudo pacman -S xorg-server-xvfb` then use `xvfb-run -a npm run tauri:dev`
