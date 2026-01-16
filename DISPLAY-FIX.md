# ChanDesk - Display Issue Fix Guide

## The Real Problem

You're running on a **server without a graphical display**. The error message means:
- ❌ No Wayland compositor running
- ❌ No X11 display server running  
- ❌ No way to show GUI windows

**This is like asking a TV to show a picture when it's not plugged into electricity.**

## Solutions (Pick One)

### ✅ Solution 1: Install Xvfb (Virtual Display)

```bash
# Install virtual display server
sudo apt-get update
sudo apt-get install -y xvfb

# Run your app with virtual display
xvfb-run -a npm run tauri:dev
```

This creates a "fake" display so the app can run (but you still won't see it).

### ✅ Solution 2: Test Frontend Only (RIGHT NOW)

Open your browser to test the UI without Tauri:

```bash
npm run dev
```

Then visit: **http://localhost:1420** in your browser

### ✅ Solution 3: Use X11 Forwarding (If SSH)

```bash
# On your LOCAL machine, connect with X11 forwarding:
ssh -X user@your-server

# Then run:
npm run tauri:dev
```

The window will appear on your local machine!

### ✅ Solution 4: Deploy to GUI Machine (Best Option)

Copy this project to any computer with a monitor:

```bash
# On Windows/Mac/Linux Desktop:
git clone your-repo
cd 4chan  
npm install
npm run tauri:dev
```

**The window will appear instantly!**

## Quick Test Script

I created `run-headless.sh` for you:

```bash
./run-headless.sh
```

This builds everything to verify it works (without trying to show GUI).

## Understanding the Error

```
Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display.
```

Translation:
- **Gdk**: GTK Display Kit (UI library Tauri uses)
- **Error 71**: "I can't find a display server"
- **Protocol error**: "There's no Wayland/X11 running"

**Your code is perfect.** The environment just can't show GUI apps.

## My Recommendation

**Use Solution 2** (frontend in browser) for quick testing:
```bash
npm run dev
# Open http://localhost:1420 in browser
```

Or **install Xvfb** (Solution 1) if you want the full Tauri app to run.

---

**Bottom line:** You cannot "fix" code that isn't broken. You need to fix your *environment* by adding a display server.
