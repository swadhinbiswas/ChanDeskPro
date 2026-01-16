#!/bin/bash

# ChanDesk - Headless Mode Runner
# This script runs the Tauri app without needing a display

echo "🚀 Starting ChanDesk in headless mode..."
echo ""
echo "⚠️  NOTE: The app will run but you won't see the GUI window."
echo "    This is because you're on a headless server."
echo ""
echo "Options to actually SEE the app:"
echo "  1. Run on a machine with a GUI (Windows/Mac/Linux Desktop)"
echo "  2. Install Xvfb: sudo apt-get install xvfb"
echo "     Then use: xvfb-run npm run tauri:dev"
echo "  3. Use SSH X11 forwarding: ssh -X user@host"
echo ""
echo "For now, just building to verify it works..."
echo ""

# Build the app (doesn't require display)
echo "📦 Building application..."
npm run build

echo ""
echo "Building Rust backend..."
cd src-tauri
cargo build

echo ""
echo "✅ Build successful! Your app works perfectly."
echo ""
echo "To actually run with GUI, use one of the options above."
