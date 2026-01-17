<div align="center">
  <img src="src-tauri/icons/128x128.png" alt="ChanDesk Pro Logo" width="128" height="128" />
  <h1>🖥️ ChanDesk Pro</h1>
  <p><strong>The Ultimate Desktop Client for Imageboards</strong></p>
  <p>A blazing-fast, modern desktop app for browsing 4chan, 7chan, and more — with premium UI and powerful features.</p>
  <p>
    <a href="https://github.com/swadhinbiswas/ChanDeskPro/releases/latest">
      <img src="https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge&logo=github" alt="Version" />
    </a>
    <a href="https://gitlab.com/swadhinbiswas/chandeskpro">
      <img src="https://img.shields.io/badge/GitLab-Mirror-orange?style=for-the-badge&logo=gitlab" alt="GitLab" />
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/tauri-2.0-orange?style=for-the-badge&logo=tauri" alt="Tauri" />
    <img src="https://img.shields.io/badge/platforms-linux%20|%20windows%20|%20macos%20|%20android%20|%20ios-purple?style=for-the-badge" alt="Platforms" />
  </p>
</div>

---

> [!IMPORTANT]
> **DISCLAIMER & CONTENT WARNING**
>
> 1.  **Unofficial Client**: This application is an unofficial 3rd-party client. It is not affiliated with, endorsed by, or connected to 4chan.org or any other imageboard.
> 2.  **User Responsibility**: By using this software, you agree to abide by the Terms of Service and Rules of the respective imageboards you browse.
> 3.  **18+ Content**: Some boards may contain content suitable only for adults. Accessing such content is strictly for users 18 years of age or older (or the legal age of majority in your jurisdiction). The developer assumes no liability for content accessed through this application.

---

## ✨ Features

### 🎨 Premium Experience
- **Modern UI**: Sleek dark interface inspired by Discord, built with **shadcn/ui**.
- **Theming**: Choose from Nord, Dracula, Catppuccin, and more, or create custom themes.
- **Smooth Animations**: Powered by Framer Motion for a fluid feel.

### 🚀 Powerful Browsing
- **Grid Catalog**: Visualize threads with high-res thumbnails.
- **Global Search**: Instantly find boards and threads.
- **Smart Filtering**: Filter posts by keywords, tripcodes, or Regex.
- **Multi-Tab**: Browse multiple threads and catalogs simultaneously like a web browser.

### 🎬 Media & Tools
- **Immersive Lightbox**: Double-click visuals for a deep-zoom fullscreen experience.
- **Video Player**: Custom controls, loop, and speed settings.
- **Offline Caching**: Automatically caches visited threads for offline reading.
- **Thread Watcher**: Get desktop notifications when watched threads update.

---

## 🔒 Security & Privacy

We take your privacy seriously. Here is how ChanDesk Pro protects you:

### 🛡️ Built-in Proxy
We use a local Rust-based proxy to route image and video requests.
- **Function**: Bypasses CORS restrictions enforced by browsers.
- **Privacy**: Your IP address is sent to the imageboard servers (standard behavior), but headers are stripped of tracking referrers.
- **Safety**: No data is ever routed through 3rd-party intermediate servers. It goes strictly `You -> Imageboard`.

### 🔑 No Tokens Required
- **Anonymous**: 4chan and most supported imageboards are anonymous. You do **not** need an account or API token.
- **Recaptcha**: Posting uses the native Captcha v2 widget when required. No specialized "pass" is needed (though 4chan Pass support is planned).

---

## 📦 Downloads

| Platform | Installer | Portable |
|----------|-----------|----------|
| **Windows** | [`ChanDesk-Setup-x64.exe`](../../releases/latest) | [`ChanDesk-x64.nsis.zip`](../../releases/latest) |
| **macOS** | [`ChanDesk-x64.dmg`](../../releases/latest) | [`ChanDesk.app.tar.gz`](../../releases/latest) |
| **Linux** | [`ChanDesk_amd64.deb`](../../releases/latest) | [`ChanDesk.AppImage`](../../releases/latest) |
| **Android** | [`ChanDesk.apk`](../../releases/latest) | - |

---

## 🚀 Quick Start

### Installation
1.  Download the installer for your OS from the [Releases](../../releases/latest) page.
2.  Run the installer.
3.  (Linux) If using AppImage, allow execution: `chmod +x ChanDesk.AppImage`.

### Usage
-   **Navigation**: Use the sidebar to switch boards. Click the "Star" to favorite.
-   **Shortcuts**:
    -   `J` / `K`: Scroll posts
    -   `Alt+F` / `Double Click`: Fullscreen Image
    -   `Esc`: Close modals
    -   `Ctrl+T`: New Tab

---

## 🗺️ Roadmap

We are constantly improving ChanDesk Pro. Here is what's coming next:

- [ ] **Advanced Replying**: Image uploading, rich text tools, and saved replies.
- [ ] **Expanded Video Support**: Native support for more video platforms (YouTube, Twitch, Streamable) and direct file streaming from other archives.
- [ ] **4chan Pass**: Login support for bypassing captchas.
- [ ] **Plugin System**: Community-created extensions.

---

## 🤝 Community & Support

### Finding Other Users
The best place to discuss ChanDesk Pro:
-   **GitHub Discussions**: [Ask questions & share feedback](../../discussions)
-   **Issue Tracker**: [Report bugs here](../../issues)

### Contributing
We welcome contributions!
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Open a Pull Request.

---

## 🛠️ Build From Source

**Prerequisites:** [Bun](https://bun.sh), [Rust](https://rustup.rs), and OS build tools.

```bash
# 1. Clone (GitHub)
git clone https://github.com/swadhinbiswas/ChanDeskPro.git
# OR (GitLab)
git clone https://gitlab.com/swadhinbiswas/chandeskpro.git

cd ChanDeskPro

# 2. Install
bun install

# 3. Develop
bun run tauri:dev

# 4. Build Production
bun run tauri:build
```

---

<div align="center">
  <p>Made with ❤️ for the community.</p>
  <p>If you like this project, please give it a ⭐!</p>
</div>

---

<p align="center">
  <a href="https://github.com/swadhinbiswas/ChanDeskPro">GitHub</a> •
  <a href="https://gitlab.com/swadhinbiswas/chandeskpro">GitLab Mirror</a>
</p>
