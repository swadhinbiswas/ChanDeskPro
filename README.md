<div align="center">
  <img src="src-tauri/icons/128x128.png" alt="ChanDesk Pro Logo" width="128" height="128" />
  <h1>🖥️ ChanDesk Pro</h1>
  <h3>The Ultimate Desktop Client for Imageboards</h3>
  <p>A blazing-fast, privacy-focused desktop app for browsing 4chan with a premium UI and powerful features.</p>

  <p>
    <a href="https://github.com/swadhinbiswas/ChanDeskPro/releases/latest">
      <img src="https://img.shields.io/github/v/release/swadhinbiswas/ChanDeskPro?style=for-the-badge&logo=github&color=7c3aed" alt="Release" />
    </a>
    <a href="https://github.com/swadhinbiswas/ChanDeskPro/releases">
      <img src="https://img.shields.io/github/downloads/swadhinbiswas/ChanDeskPro/total?style=for-the-badge&logo=github&color=10b981" alt="Downloads" />
    </a>
    <a href="https://github.com/swadhinbiswas/ChanDeskPro/stargazers">
      <img src="https://img.shields.io/github/stars/swadhinbiswas/ChanDeskPro?style=for-the-badge&logo=github&color=f59e0b" alt="Stars" />
    </a>
    <a href="LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Tauri-2.0-FFC131?style=flat-square&logo=tauri&logoColor=white" alt="Tauri" />
    <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" alt="Rust" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  </p>

  <p>
    <a href="https://swadhinbiswas.github.io/ChanDeskPro/">🌐 Website</a> •
    <a href="#-quick-start">⚡ Quick Start</a> •
    <a href="#-features">✨ Features</a> •
    <a href="#-downloads">📥 Downloads</a> •
    <a href="https://github.com/swadhinbiswas/ChanDeskPro/discussions">💬 Community</a>
  </p>
</div>

---

<div align="center">
  <table>
    <tr>
      <td align="center" width="400">
        <img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/palette/macchiato.png" width="400" alt="Theme Preview" />
        <br />
        <sub><b>🎨 Beautiful Themes</b></sub>
      </td>
      <td align="center" width="400">
        <img src="https://img.shields.io/badge/⚡_Blazing_Fast-Rust_Powered-orange?style=for-the-badge" height="60" alt="Fast" />
        <br />
        <sub><b>🚀 Native Performance</b></sub>
      </td>
    </tr>
  </table>
</div>

---

> [!IMPORTANT]
> **DISCLAIMER**: This is an unofficial third-party client. Not affiliated with 4chan.org.
> Some boards contain 18+ content — user discretion is advised.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 Premium Experience
- **Modern Dark UI** — Sleek interface built with shadcn/ui
- **10+ Themes** — Nord, Dracula, Catppuccin, and more
- **Smooth Animations** — Framer Motion powered transitions

### 🚀 Power Browsing
- **Grid Catalog** — Visual thread browsing with thumbnails
- **Global Search** — Find boards and threads instantly
- **Smart Filtering** — Keywords, tripcodes, regex support
- **Multi-Tab** — Browser-style tabbed interface

</td>
<td width="50%">

### 🎬 Media & Tools
- **Immersive Lightbox** — Fullscreen zoom experience
- **Video Player** — Custom controls, loop, speed
- **Offline Cache** — Browse threads without internet
- **Thread Watcher** — Desktop notifications for updates

### 🔒 Privacy First
- **No Tracking** — Zero analytics or telemetry
- **No Account** — Completely anonymous browsing
- **Open Source** — Fully auditable codebase
- **Direct Connection** — No third-party servers

</td>
</tr>
</table>

---

## 📥 Downloads

<div align="center">

| Platform | Download | Architecture |
|:--------:|:--------:|:------------:|
| **🪟 Windows** | [**Download .exe**](https://github.com/swadhinbiswas/ChanDeskPro/releases/latest) | x64, ARM64 |
| **🍎 macOS** | [**Download .dmg**](https://github.com/swadhinbiswas/ChanDeskPro/releases/latest) | Intel, Apple Silicon |
| **🐧 Linux** | [**Download**](https://github.com/swadhinbiswas/ChanDeskPro/releases/latest) | .deb, .AppImage, .rpm |

</div>

> [!TIP]
> **Linux Users**: If using AppImage, make it executable first: `chmod +x ChanDesk*.AppImage`

---

## ⚡ Quick Start

### Install & Run
1. Download the installer for your OS from [**Releases**](https://github.com/swadhinbiswas/ChanDeskPro/releases/latest)
2. Run the installer
3. Launch ChanDesk Pro and start browsing!

### ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Scroll posts | `J` / `K` |
| Fullscreen image | `Alt+F` or `Double Click` |
| Close modals | `Esc` |
| New tab | `Ctrl+T` |

---

## 🛠️ Build from Source

**Prerequisites:** [Bun](https://bun.sh), [Rust](https://rustup.rs)

```bash
# Clone the repository
git clone https://github.com/swadhinbiswas/ChanDeskPro.git
cd ChanDeskPro

# Install dependencies
bun install

# Run in development mode
bun run tauri:dev

# Build for production
bun run tauri:build
```

See [BUILD.md](BUILD.md) for detailed build instructions and troubleshooting.

---

## 🗺️ Roadmap

- [ ] 📤 **Advanced Replying** — Image upload, rich text
- [ ] 🎥 **Expanded Video** — YouTube, Twitch embeds
- [ ] 🔑 **4chan Pass** — Captcha bypass support
- [ ] 🔌 **Plugin System** — Community extensions

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes
4. **Push** to the branch
5. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🔒 Security & Privacy

| Feature | Description |
|---------|-------------|
| 🛡️ **Built-in CORS Proxy** | Routes requests through local Rust proxy, strips tracking headers |
| 🔑 **No API Tokens** | Anonymous by design, no accounts needed |
| 🔐 **No Telemetry** | Zero data collection or analytics |
| 🌐 **Direct Connection** | `You → Imageboard` — no intermediaries |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>
    <b>If you find ChanDesk Pro useful, please consider giving it a ⭐!</b>
  </p>
  <p>
    <a href="https://github.com/swadhinbiswas/ChanDeskPro">GitHub</a> •
    <a href="https://gitlab.com/swadhinbiswas/chandeskpro">GitLab Mirror</a> •
    <a href="https://swadhinbiswas.github.io/ChanDeskPro/">Website</a>
  </p>
  <p>
    <sub>Made with ❤️ by the community</sub>
  </p>
</div>
