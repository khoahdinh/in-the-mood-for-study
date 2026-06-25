# 🌸 In The Mood For Study

A desktop productivity app — Pomodoro timer, music player, and ambient sounds, all wrapped in a soft pink-black aesthetic.

Built with Electron and vanilla JavaScript, as a way to actually _learn_ JS by shipping something real — not just another to-do list tutorial clone.

![platform](https://img.shields.io/badge/platform-Windows-blue)
![stack](https://img.shields.io/badge/stack-Electron%20%2B%20Vanilla%20JS-ff2d78)
![status](https://img.shields.io/badge/status-in%20progress-yellow)

![screenshot](./assets/images/Screenshot.png)
![screenshot](./assets/images/Screenshot2.png)
![screenshot](./assets/images/Screenshot3.png)

## ✨ Features

- **⏱️ Pomodoro Timer** — fully customizable focus/break intervals, auto long break after N rounds, live progress
- **🎵 Music Player** — upload your own MP3s, build a playlist, vinyl record that actually spins (and decelerates like a real one when paused)
- **🔔 Ambient Sounds** — built-in sound options with live preview and independent volume control
- **🖼️ Background Switcher** — pick from a built-in image library, applied instantly
- **🌸 Vintage UI** — pink-black theme, cafe conner backdrop, no design system shortcuts

## 🛠️ Tech Stack

- **Electron** — desktop shell
- **HTML / CSS / Vanilla JavaScript** — no frameworks, on purpose (this project is the framework-learning step before frameworks)
- **localStorage** — settings persistence
- **electron-builder** — packaging into a Windows installer

## 🚀 Getting Started

**Just want to try the app?**
Grab the latest installer from [Releases](../../releases) — download, run, done.

**Want to run it from source?**

```bash
git clone https://github.com/khoahdinh/in-the-mood-for-study.git
cd in-the-mood-for-study
npm install
npm start
```

**Want your own installer?**

```bash
npm run dist
```

The packaged `.exe` will show up in `dist/`.

## ⚠️ Known Limitations

- **Uploaded playlists don't survive a restart.** Uploaded tracks use temporary blob URLs (`URL.createObjectURL`), which die with the session — they're never written to disk. The correct fix is routing uploads through Electron's IPC to copy files into `app.getPath("userData")`. Flagged here instead of quietly ignored, because pretending a limitation doesn't exist is worse than naming it.

## 🗺️ Roadmap

- [ ] localStorage persistence for Pomodoro & Sound settings
- [ ] Persistent playlist storage (via IPC, see above)

## 📄 License

ISC

## 🙋 Author

**khoahdinh** — first-year university student, learning JavaScript one feature at a time.
Feedback, bug reports, and roasts welcome via [Issues](../../issues).
