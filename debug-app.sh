#!/bin/bash

# Debug script to check what's actually happening

echo "=== Checking if Vite is running ==="
curl -s http://localhost:1420 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Vite dev server is responding"
else
    echo "❌ Vite dev server is NOT responding"
fi

echo ""
echo "=== Checking React mounting ==="
curl -s http://localhost:1420 | grep -o '<div id="root">' 
if [ $? -eq 0 ]; then
    echo "✅ Root div exists"
else
    echo "❌ Root div missing"
fi

echo ""
echo "=== Checking for JavaScript files ==="
curl -s http://localhost:1420 | grep -o 'src="/src/main.tsx"'
if [ $? -eq 0 ]; then
    echo "✅ main.tsx is referenced"
else
    echo "❌ main.tsx not found in HTML"
fi

echo ""
echo "=== Starting app with console output ==="
WEBKIT_DISABLE_COMPOSITING_MODE=1 WEBKIT_DISABLE_DMABUF_RENDERER=1 npm run tauri:dev
