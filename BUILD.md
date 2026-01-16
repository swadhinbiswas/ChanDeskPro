# Cross-Platform Build Guide

## Supported Platforms

| Platform | Format | Status |
|----------|--------|--------|
| **Linux** | `.deb`, `.AppImage`, `.rpm` | ✅ Ready |
| **Windows** | `.msi`, `.exe` (NSIS) | ✅ Ready |
| **macOS Intel** | `.dmg`, `.app` | ✅ Ready |
| **macOS ARM** | `.dmg`, `.app` | ✅ Ready |
| **Android** | `.apk` | ✅ Ready |
| **iOS** | `.ipa` | ✅ Ready |

---

## Quick Build Commands

### Desktop (Current Platform)
```bash
# Development
bun run tauri:dev

# Production build
bun run tauri:build
```

### Linux
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev

# Build
cargo tauri build
```

### Windows
```powershell
# No extra dependencies needed
cargo tauri build
```

### macOS
```bash
# Intel
rustup target add x86_64-apple-darwin
cargo tauri build --target x86_64-apple-darwin

# Apple Silicon
rustup target add aarch64-apple-darwin
cargo tauri build --target aarch64-apple-darwin
```

---

## Mobile Builds

### Android
```bash
# Setup
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
cargo tauri android init

# Build APK
cargo tauri android build --apk

# Build AAB (Play Store)
cargo tauri android build --aab
```

### iOS
```bash
# Setup (macOS only)
rustup target add aarch64-apple-ios x86_64-apple-ios
cargo tauri ios init

# Build
cargo tauri ios build
```

---

## GitHub Actions CI/CD

Push a tag to trigger builds:
```bash
git tag v0.1.0
git push origin v0.1.0
```

Artifacts will be uploaded for all platforms!

---

## Output Locations

| Platform | Path |
|----------|------|
| Linux DEB | `src-tauri/target/release/bundle/deb/` |
| Linux AppImage | `src-tauri/target/release/bundle/appimage/` |
| Windows MSI | `src-tauri/target/release/bundle/msi/` |
| Windows NSIS | `src-tauri/target/release/bundle/nsis/` |
| macOS DMG | `src-tauri/target/release/bundle/dmg/` |
| Android APK | `src-tauri/gen/android/app/build/outputs/apk/` |
| iOS IPA | `src-tauri/gen/apple/build/` |
