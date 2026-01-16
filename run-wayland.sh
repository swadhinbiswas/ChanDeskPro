#!/bin/bash

# Fix for running Tauri on KDE Plasma Wayland
# Your terminal doesn't have the Wayland environment variables

# Set Wayland display (usually wayland-0 on KDE)
export WAYLAND_DISPLAY=wayland-0

# Also set XDG runtime dir if not set
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/run/user/$(id -u)}

# Run the app
npm run tauri:dev
