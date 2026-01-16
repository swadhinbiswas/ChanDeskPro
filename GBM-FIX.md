# 🔧 ChanDesk - GBM Buffer Error Fix (KDE Plasma Wayland)

## Your Specific Issue

You're running **KDE Plasma on Wayland** with a monitor connected, but getting:
```
Failed to create GBM buffer of size XXXxXXX: Invalid argument
```

This is a **WebKitGTK graphics driver incompatibility**, NOT a code issue.

## Root Cause

- You're on Wayland (KDE Plasma)
- WebKitGTK is trying to use hardware acceleration  
- Your GPU/driver combo doesn't support the way WebKitGTK creates GBM buffers
- This is a known issue with certain AMD/Intel/NVIDIA drivers

## ✅ Solution 1: Install Missing Graphics Libraries

```bash
# Install mesa and related GL libraries
sudo pacman -S mesa mesa-utils libva-mesa-driver

# For NVIDIA users, also install:
sudo pacman -S nvidia-utils  # or nvidia-390xx-utils, etc.

# Reboot your system
sudo reboot
```

After rebooting, try:
```bash
npm run tauri:dev
```

## ✅ Solution 2: Use Software Rendering

Force software rendering to bypass GPU issues:

```bash
# Already added to package.json:
npm run tauri:dev

# Or manually:
LIBGL_ALWAYS_SOFTWARE=1 GDK_BACKEND=x11 npm run tauri:dev  
```

## ✅ Solution 3: Update WebKitGTK

```bash
# Update to latest WebKitGTK
sudo pacman -Syu webkit2gtk-4.1

# Clear Tauri cache and rebuild
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```

## ✅ Solution 4: Switch to X11 Session (Temporary)

Log out and log back in selecting "Plasma (X11)" instead of "Plasma (Wayland)":

1. Log out  
2. At login screen, click session type (bottom-left usually)
3. Select "Plasma (X11)"
4. Log in
5. Run your app - should work perfectly

## ✅ Solution 5: Check Your GPU Driver

```bash
# Check what GPU you have
lspci | grep VGA

# Check current driver
glxinfo | grep "OpenGL renderer"

# For NVIDIA proprietary:
nvidia-smi  # Should show GPU info if working
```

**Common Issues:**
- **NVIDIA:** Proprietary driver conflicts with Wayland
- **Intel:** Missing `intel-media-driver`
- **AMD:** Missing `vulkan-radeon` or `amdvlk`

### Install Missing Drivers:

**Intel:**
```bash
sudo pacman -S intel-media-driver vulkan-intel
```

**AMD:**
```bash
sudo pacman -S vulkan-radeon lib32-vulkan-radeon
```

**NVIDIA:**
```bash
sudo pacman -S nvidia nvidia-utils  # For latest GPUs
# OR
sudo pacman -S nvidia-470xx-dkms nvidia-470xx-utils  # For older GPUs
```

## ✅ Solution 6: Test with Simple GTK App

Verify the issue isn't specific to Tauri:

```bash
# Install a simple WebKitGTK browser
sudo pacman -S epiphany

# Try running it
epiphany

# If Epiphany also fails, it's definitely a WebKitGTK/driver issue
```

## 🎯 Recommended Fix Order

1. **Try Solution 4** (Switch to X11) - Quickest test
2. **Try Solution 1** (Install mesa libs) - Most likely fix
3. **Try Solution 5** (Update GPU drivers) - If still broken
4. **Try Solution 3** (Update WebKitGTK) - Last resort

## 🛠️ Debug Commands

```bash
# Check your session type
echo $XDG_SESSION_TYPE  # Should show "wayland"

# Check WAYLAND_DISPLAY
echo $WAYLAND_DISPLAY  # Should show "wayland-0" or "wayland-1"

# Check if hardware acceleration works
glxinfo | grep "direct rendering"  # Should say "Yes"

# Test WebGL
chromium --use-gl=desktop  # Should open without errors
```

## After Fixing

Once it works, update `package.json`:

```json
{
  "scripts": {
    "tauri:dev": "tauri dev",  // Remove workaround if X11 session works
    "tauri:dev:wayland": "WAYLAND_DISPLAY=wayland-1 tauri dev"
  }
}
```

---

**TL;DR:** Your app code is perfect. This is a Linux graphics stack issue. Try logging into X11 session or installing mesa packages.
