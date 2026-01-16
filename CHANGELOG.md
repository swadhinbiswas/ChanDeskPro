# Changelog

All notable changes to ChanDesk Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Cross-platform build support (Linux, Windows, macOS, Android, iOS)
- GitHub Actions CI/CD workflow

---

## [0.1.0] - 2025-01-17

### Added

#### Core Features
- **Board Browsing**: Grid catalog view with sorting (bump, replies, images, newest)
- **Thread Viewing**: Full thread display with greentext, quotes, and backlinks
- **Multi-Tab Interface**: Browser-like tabs for multiple boards/threads
- **Thread Watching**: Track threads with new reply notifications
- **Thread Caching**: SQLite-based offline thread caching

#### Multi-Provider Support
- 4chan (full API support)
- 7chan (HTML scraping)
- 4plebs Archive

#### Premium UI
- Dark mode with glassmorphism effects
- shadcn/ui component integration
- Framer Motion animations
- 7 preset themes (Default, Nord, Dracula, Monokai, Gruvbox, Solarized, Catppuccin)
- Custom accent color picker
- Gradient backgrounds and glow effects

#### Media
- Custom video player with full controls
- Image lightbox with zoom/pan
- Media gallery with keyboard navigation
- Video proxying via local HTTP server

#### Settings
- Font size adjustment
- View density options
- NSFW blur toggle
- Desktop notifications
- Proxy configuration
- 4chan Pass token storage

#### Keyboard Shortcuts
- Post navigation (J/K)
- Thread actions (W, R, O)
- Gallery controls (G, F)
- Tab management (Ctrl+T, Ctrl+W)
- Settings (Ctrl+,)
- Help (?)

#### Filtering
- Keyword filters
- Tripcode filters
- Regex filters
- Hide threads/posts
- Subject filters

#### Developer
- TypeScript frontend
- Rust backend
- API rate limiting (1 req/sec)
- Structured logging
- Error handling

### Technical
- Tauri v2 framework
- React 18 with TanStack Query
- Zustand state management
- SQLite caching layer
- Local video proxy server

---

## Development Roadmap

### v0.2.0 (Planned)
- [ ] Inline reply chains
- [ ] Thread statistics
- [ ] Archive search integration
- [ ] Reverse image search

### v0.3.0 (Planned)
- [ ] Email verification for posting
- [ ] Enhanced captcha handling
- [ ] More imageboard providers

---

[Unreleased]: https://github.com/YOUR_USERNAME/chandesk/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/YOUR_USERNAME/chandesk/releases/tag/v0.1.0
