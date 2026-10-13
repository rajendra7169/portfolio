// The Projects launcher and every project page read from here. The words on the
// project pages live in this file; screens come from `npm run images` (lib/media.json).
import media from "./media.json";
import type { Tech } from "./content";

export type Platform = "android" | "ios" | "windows" | "linux" | "macos" | "web";
export const PLATFORMS: Record<Platform, { label: string; icon: string }> = {
  android: { label: "Android", icon: "logos:android-icon" },
  ios: { label: "iPhone", icon: "logos:apple" },
  windows: { label: "Windows", icon: "logos:microsoft-windows-icon" },
  linux: { label: "Linux", icon: "logos:linux-tux" },
  macos: { label: "macOS", icon: "logos:apple" },
  web: { label: "Web", icon: "logos:chrome" },
};

export type Media = { src: string; w: number; h: number; top: string };
const all = media as Record<string, Media>;
/** A screen from lib/media.json, by "<slug>/<name>". */
export function shot(key: string): Media {
  const m = all[key];
  if (!m) throw new Error(`No screen "${key}" in lib/media.json — run npm run images`);
  return m;
}

/** Whether a screen has been through `npm run images`. */
export const hasShot = (key: string) => key in all;

/** One screen in a tour: the image plus what it shows. */
export type Screen = { img: string; title: string; note: string };
export type Stat = { value: number; decimals?: number; suffix?: string; label: string };
export type Step = { label: string; sub: string };

export type Project = {
  slug: string;
  name: string;
  /** Eyebrow above the name. */
  kind: string;
  tagline: string;
  summary: string;
  started: string;
  platforms: Platform[];
  accent: string;
  /** The project page's own world: its page colour (the launch portal fills with it) and tone. */
  world: { bg: string; tone: "dark" | "light" };
  /** Launcher tile: the icon on a background, or a drawn glyph when there's no icon file. */
  tile: { bg: string; glyph?: "jarvis" | "vocabu"; pad?: number };
  /** Which launcher screens the app sits on: only the platforms it really runs on. */
  on: { android?: boolean; iphone?: boolean; windows?: boolean; linux?: boolean };
  /** The full page, with its own signature section. */
  featured: boolean;
  stats: Stat[];
  links: { label: string; href: string; primary?: boolean }[];
  note?: string;
  credit?: string;
  /** Android screens (shown on the Galaxy), iPhone screens, desktop screens. */
  phone?: Screen[];
  iphone?: Screen[];
  desktop?: { os: ("windows" | "linux")[]; screens: Screen[] };
  features: { icon: string; title: string; text: string }[];
  flow: { title: string; intro: string; steps: Step[] };
  stack: { group: string; techs: Tech[] }[];
};

const GH = "https://github.com/rajendra7169";

export const projectsPage = {
  intro:
    "Seven apps, each on the screens it really runs on: a laptop you can switch between Windows and Linux, an Android phone and an iPhone. Tap an app to open it.",
};

export const projects: Project[] = [
  {
    slug: "blazify",
    name: "Blazify",
    kind: "Music player · Open source",
    tagline: "Stream it. Feel it. Blaze it.",
    summary:
      "A free, open-source music player for Android, iPhone, Windows and Linux. Millions of songs sit next to the music already on your device, with offline downloads, word-by-word synced lyrics, a 10-band equalizer and colours that follow the album art. No ads, no tracking, no account needed.",
    started: "Jul 15, 2026",
    platforms: ["android", "ios", "windows", "linux"],
    accent: "#ff8a3d",
    world: { bg: "#0b0a09", tone: "dark" },
    tile: { bg: "#0b0a09", pad: 0.2 },
    on: { android: true, iphone: true, windows: true, linux: true },
    featured: true,
    stats: [
      { value: 3, label: "native apps" },
      { value: 4, label: "platforms" },
      { value: 1431, label: "commits" },
      { value: 6, label: "player designs" },
    ],
    links: [
      { label: "Website", href: "https://rajendra7169.github.io/blazify/", primary: true },
      { label: "Download for Android", href: "https://apkpure.com/blazify/com.blazify.music" },
      { label: "Source", href: `${GH}/blazify` },
    ],
    credit:
      "The Android app builds on the open-source Metrolist / InnerTune core; the interface, theming and features on top are Rajendra's own. The desktop app is original apart from its InnerTube client, and the iPhone app is written from scratch in SwiftUI.",
    phone: [
      { img: "blazify/phone-home", title: "Home", note: "A greeting that knows the time of day, your mixes, mood chips and quick picks, with the mini player always in reach." },
      { img: "blazify/phone-player", title: "Now playing", note: "Colours are pulled from the artwork, so every song repaints the player. Queue, cast, sleep timer and lyrics sit along the bottom." },
      { img: "blazify/phone-search", title: "Search", note: "Songs, albums, artists and community playlists, with voice search and song recognition." },
      { img: "blazify/phone-library", title: "Library", note: "Liked songs, your top 50, cached and downloaded music, and the songs already on the phone." },
      { img: "blazify/phone-eq", title: "Equalizer", note: "Ten bands from 31 Hz to 16 kHz, 13 presets and a live response curve." },
      { img: "blazify/phone-look", title: "Look & Feel", note: "A live preview while you pick the theme, player, mini-player and lyrics styles." },
      { img: "blazify/phone-together", title: "Blaze Together", note: "Make a room, share the code, and everyone hears the same second of the same song." },
    ],
    iphone: [
      { img: "blazify/iphone-home", title: "Home", note: "The same greeting, mixes and quick picks, rebuilt in SwiftUI with none of the Android code." },
      { img: "blazify/iphone-explore", title: "Moods & genres", note: "Each mood opens its own shelves: listen again, quick picks, mixed for you and community playlists." },
      { img: "blazify/iphone-cassette", title: "Player themes", note: "Every design previews live before you apply it. Here, the cassette with its reels turning." },
      { img: "blazify/iphone-videoart", title: "Video Art", note: "When a song has a music video, it can play behind the player instead of the artwork." },
      { img: "blazify/iphone-look", title: "Look & Feel, in light", note: "The same hub with a live preview, here in light mode." },
      { img: "blazify/iphone-theme", title: "Theme & colour", note: "System, light, dark or pure black, and a palette for the accent colour." },
    ],
    desktop: {
      os: ["linux", "windows"],
      screens: [
        { img: "blazify/desk-home", title: "Home", note: "The same catalogue on a big screen, with your library in the sidebar and the player along the bottom." },
        { img: "blazify/desk-podcasts", title: "Podcasts", note: "Shows from two directories at once, with charts by country, follow, chapters and episode notes." },
        { img: "blazify/desk-looks", title: "Player looks", note: "Classic, Ring, Full art, Record or Cassette: pick how the player looks." },
        { img: "blazify/desk-kept", title: "Kept as you listen", note: "Songs are kept as you play them, and the oldest go first when space runs low." },
        { img: "blazify/desk-feel", title: "Look and feel", note: "Artwork colour, dark, light or system theme, accent swatches and slider styles." },
      ],
    },
    features: [
      { icon: "🎧", title: "Millions of songs", text: "Songs, albums, artists, playlists and podcasts, next to the music already on your device." },
      { icon: "⬇️", title: "Offline first", text: "Downloads, songs kept as you play, and minutes buffered ahead so a dropped signal doesn't stop the song." },
      { icon: "🎤", title: "Synced lyrics", text: "Word by word from several providers in the order you choose, with translation and romanization." },
      { icon: "🎚️", title: "10-band equalizer", text: "13 presets, preamp, bass boost, surround, reverb and AutoEQ headphone profiles." },
      { icon: "🎨", title: "Your colours", text: "Dynamic colour from the artwork, custom colours, pure black and six player designs." },
      { icon: "👥", title: "Blaze Together", text: "Listening rooms over WebSockets on his own server. The wire carries the song and the second, never the audio." },
      { icon: "📥", title: "Bring your playlists", text: "Import from Spotify, a file or a link, and share a playlist as a link or a QR code." },
      { icon: "🔒", title: "No strings", text: "No ads, no tracking, no account. Google sign-in is optional and only adds your YouTube Music library." },
    ],
    flow: {
      title: "From a tap to your ears",
      intro: "What happens between pressing play and hearing the first note, on Android.",
      steps: [
        { label: "Tap play", sub: "Compose UI" },
        { label: "InnerTube", sub: "catalogue client" },
        { label: "BlazifyExtractor", sub: "his own stream library" },
        { label: "Media3 ExoPlayer", sub: "gapless, next song prefetched" },
        { label: "Cache & downloads", sub: "Room database" },
        { label: "Equalizer", sub: "10 bands → your headphones" },
      ],
    },
    stack: [
      { group: "Android", techs: [{ name: "Kotlin", icon: "logos:kotlin-icon" }, { name: "Jetpack Compose", icon: "simple-icons:jetpackcompose", color: "#4285f4" }, { name: "Android", icon: "logos:android-icon" }] },
      { group: "Desktop", techs: [{ name: "Compose Desktop", icon: "simple-icons:jetpackcompose", color: "#4285f4" }, { name: "libVLC", icon: "simple-icons:vlcmediaplayer", color: "#ff8800" }, { name: "Linux", icon: "logos:linux-tux" }, { name: "Windows", icon: "logos:microsoft-windows-icon" }] },
      { group: "iPhone", techs: [{ name: "Swift", icon: "logos:swift" }, { name: "SwiftUI", icon: "logos:apple" }, { name: "Codemagic", icon: "simple-icons:codemagic", color: "#f45e3f" }] },
      { group: "Together server", techs: [{ name: "Go", icon: "simple-icons:go", color: "#00add8" }, { name: "Docker", icon: "logos:docker-icon" }] },
    ],
  },
  {
    slug: "fitevo",
    name: "Fitevo",
    kind: "Fitness & nutrition · AI",
    tagline: "Log a meal in one sentence. See everything in one glance.",
    summary:
      "A free, local-first fitness, nutrition and workout tracker for beginner gym-goers. Type, say or photograph what you ate and AI works out the calories and macros. It builds your workout routine, logs every set, spots your personal records, tracks progress, and has a coach you can ask anything, without the shaming.",
    started: "Jun 17, 2026",
    platforms: ["android"],
    accent: "#e8702c",
    world: { bg: "#12100e", tone: "dark" },
    tile: { bg: "#12100e", pad: 0.16 },
    on: { android: true },
    featured: true,
    stats: [
      { value: 800, suffix: "+", label: "photo exercises" },
      { value: 11, label: "badges" },
      { value: 3, label: "AI providers" },
      { value: 57, suffix: "k", label: "lines of Dart" },
    ],
    links: [{ label: "Source", href: `${GH}/fitevo`, primary: true }],
    phone: [
      { img: "fitevo/phone-d-today", title: "Morning", note: "Day 22 of the streak: 1,136 kcal left of 2,631, macros, water, fibre and sodium, and today's workout." },
      { img: "fitevo/phone-d-meals", title: "Breakfast, then lunch", note: "“Oats with banana and milk, 1 chiya”, then dal bhat with chicken curry: each sentence becomes a meal, item by item." },
      { img: "fitevo/phone-d-routine", title: "Upper day", note: "The Upper/Lower routine knows what's next, and the muscle map shows what the week has hit." },
      { img: "fitevo/phone-d-workout", title: "Mid-set", note: "Barbell row, set 3 of 4: 47.5 kg × 6, a rest timer, and a nudge to add 2.5 kg next time." },
      { img: "fitevo/phone-d-prs", title: "Records", note: "Every lift's best and estimated one-rep max, with its strength level against bodyweight." },
      { img: "fitevo/phone-d-musclemap", title: "What it hit", note: "A body map of the last seven days, push against pull, quads against hamstrings, sets per muscle." },
      { img: "fitevo/phone-d-progress", title: "Progress", note: "A 22-day streak, the badges so far, the training calendar and the weight trend." },
      { img: "fitevo/phone-d-report", title: "The day, wrapped", note: "The daily report: calories, protein and carbs as rings, with water, fibre and sodium." },
    ],
    features: [
      { icon: "🍛", title: "One-sentence logging", text: "Type it, say it or snap a photo. AI estimates calories and macros, cross-checked with USDA data." },
      { icon: "🏋️", title: "Routines that fit", text: "Push/Pull/Legs, Upper/Lower, 5×5, full body, or a split the AI builds for your goal." },
      { icon: "⏱️", title: "Live workout logger", text: "Rest timer, plate calculator, exercise swaps and a full-screen PR celebration." },
      { icon: "📚", title: "800 exercises", text: "A photo library you can browse by muscle. Snap a machine and AI names it." },
      { icon: "📈", title: "Targets that adapt", text: "A rolling-average weight tunes your targets, and a calorie floor keeps them safe." },
      { icon: "💬", title: "A coach, not a critic", text: "Chat by text or voice, and a weekly review without the guilt trip." },
      { icon: "📴", title: "Local first", text: "Data lives on the phone and everything but live AI works offline. Progress photos never leave it." },
      { icon: "🏅", title: "11 badges", text: "From First bite and First lift to Century club and Half a million." },
    ],
    flow: {
      title: "Local first, AI second",
      intro: "AI only fills in the numbers. The app never waits on it, and the safety rules live in plain code.",
      steps: [
        { label: "You", sub: "text, voice or photo" },
        { label: "AI service", sub: "proxy → Groq → Gemini" },
        { label: "Health maths", sub: "calorie floor and pacing cap" },
        { label: "Isar", sub: "on the phone" },
        { label: "Firestore", sub: "optional backup, owner-only" },
      ],
    },
    stack: [
      { group: "App", techs: [{ name: "Flutter", icon: "simple-icons:flutter", color: "#02569b" }, { name: "Dart", icon: "logos:dart" }, { name: "Android", icon: "logos:android-icon" }] },
      { group: "Data", techs: [{ name: "Firebase", icon: "logos:firebase-icon" }, { name: "Google", icon: "logos:google-icon" }] },
      { group: "AI", techs: [{ name: "Gemini", icon: "simple-icons:googlegemini", color: "#8e75b2" }, { name: "Meta Llama", icon: "simple-icons:meta", color: "#0467df" }] },
    ],
  },
  {
    slug: "nexterm",
    name: "NexTerm",
    kind: "Terminal & code editor · Windows",
    tagline: "The modern, AI-powered terminal and code editor for Windows.",
    summary:
      "A daily-driver Windows terminal built from scratch. PowerShell, CMD, Git Bash and WSL in tabs and split panes, SSH profiles with an SFTP browser, an AI side panel that can read your terminal, local ghost-text autocomplete, and a Coder mode with the VS Code editor engine, git and language servers. Free and private: no accounts, no telemetry, no ads.",
    started: "May 04, 2026",
    platforms: ["windows"],
    accent: "#82aaff",
    world: { bg: "#1a1b26", tone: "dark" },
    tile: { bg: "#0f111a", pad: 0.14 },
    on: { windows: true },
    featured: true,
    stats: [
      { value: 19, label: "themes" },
      { value: 7, label: "shells" },
      { value: 8, label: "versions" },
      { value: 29, suffix: "k", label: "lines of code" },
    ],
    links: [
      { label: "Download", href: `${GH}/NexTerm/releases/latest`, primary: true },
      { label: "Source", href: `${GH}/NexTerm` },
    ],
    desktop: {
      os: ["windows"],
      screens: [
        { img: "nexterm/desk-main", title: "The terminal", note: "PowerShell 7 with the animated banner, system info, and a timer on every command." },
        { img: "nexterm/desk-shells", title: "Every shell", note: "PowerShell, CMD, Git Bash, WSL, and Zsh or Fish through WSL, colour-coded per tab." },
        { img: "nexterm/desk-splits", title: "Split panes", note: "Split any way you like, and broadcast one command to every pane at once." },
        { img: "nexterm/desk-profiles", title: "SSH profiles", note: "Hosts, identity files, jump hosts, tunnels and auto-reconnect, with SFTP built in." },
        { img: "nexterm/desk-themes", title: "19 themes", note: "Tokyo Night to Synthwave '84, plus your own colour overrides." },
        { img: "nexterm/desk-font", title: "Typography", note: "Cascadia Code or Consolas, line height, cursor style and a live preview." },
      ],
    },
    features: [
      { icon: "🤖", title: "AI that sees your terminal", text: "A side panel that reads your last 30 lines, explains errors and runs fixes, with undo for its edits." },
      { icon: "👻", title: "Ghost text", text: "Local autocomplete from Ollama, accepted with Tab. Nothing leaves the machine." },
      { icon: "🧑‍💻", title: "Coder mode", text: "Monaco, the VS Code editor engine, with git, diffs, format-on-save and language servers." },
      { icon: "🌐", title: "SSH and SFTP", text: "Profiles, jump hosts, port forwarding and a file browser for the remote machine." },
      { icon: "⬇️", title: "Quake mode", text: "A hotkey drops the terminal down from the top of the screen, from anywhere." },
      { icon: "🗂️", title: "Workspaces", text: ".nexterm.yml workspaces, session recording to asciinema, and snippets with placeholders." },
      { icon: "🔐", title: "A real vault", text: "API keys are encrypted with Windows DPAPI and never written to the settings file." },
      { icon: "🧩", title: "Extensions", text: "A marketplace served as a static registry from GitHub. No backend needed." },
    ],
    flow: {
      title: "One keystroke, end to end",
      intro: "Electron splits the work: the window draws, the main process owns the shells.",
      steps: [
        { label: "Keystroke", sub: "React + Zustand window" },
        { label: "xterm.js", sub: "renders the terminal" },
        { label: "contextBridge", sub: "a narrow, safe API" },
        { label: "node-pty", sub: "main process" },
        { label: "Your shell", sub: "PowerShell · WSL · SSH" },
      ],
    },
    stack: [
      { group: "Shell", techs: [{ name: "Electron", icon: "logos:electron" }, { name: "Node.js", icon: "logos:nodejs-icon" }, { name: "Windows", icon: "logos:microsoft-windows-icon" }] },
      { group: "Window", techs: [{ name: "React", icon: "logos:react" }, { name: "JavaScript", icon: "logos:javascript" }, { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" }, { name: "Monaco", icon: "logos:visual-studio-code" }] },
      { group: "Data & AI", techs: [{ name: "SQLite", icon: "simple-icons:sqlite", color: "#003b57" }, { name: "Ollama", icon: "simple-icons:ollama", color: "#000000" }, { name: "Claude", icon: "simple-icons:claude", color: "#d97757" }, { name: "Gemini", icon: "simple-icons:googlegemini", color: "#8e75b2" }] },
    ],
  },
  {
    slug: "jarvis",
    name: "Jarvis",
    kind: "Voice assistant · Linux",
    tagline: "Say “hey Jarvis”. It answers, and does the work.",
    summary:
      "An always-on voice assistant that runs as a background service on a Linux laptop. Say “hey Jarvis” and it answers out loud: it opens apps, sets the volume, Wi-Fi and Bluetooth, reads the screen and the camera, searches the web, remembers things, replies to email and WhatsApp, and edits code. Most of the speech stack runs on the laptop itself, behind a full-screen sci-fi HUD.",
    started: "Aug 12, 2026",
    platforms: ["linux"],
    accent: "#ff8a1a",
    world: { bg: "#040507", tone: "dark" },
    tile: { bg: "#040507", glyph: "jarvis" },
    on: { linux: true },
    featured: true,
    stats: [
      { value: 137, label: "skills" },
      { value: 722, label: "tests" },
      { value: 200, suffix: " ms", label: "wake to reply" },
      { value: 2, label: "languages" },
    ],
    links: [],
    note: "The source is private for now.",
    desktop: {
      os: ["linux"],
      screens: [
        { img: "jarvis/desk-speaking", title: "Speaking", note: "The MARK theme. The core pulses while Jarvis talks, and you can cut in mid-sentence." },
        { img: "jarvis/desk-idle", title: "Listening", note: "Idle, waiting for the wake word, with the weather, system load and voice stack around the core." },
        { img: "jarvis/desk-ion", title: "The ION theme", note: "The original cyan look, with the router's decisions scrolling on the event bus." },
      ],
    },
    features: [
      { icon: "🎙️", title: "Wake word", text: "“Hey Jarvis”, or just “Jarvis”, heard on the laptop by openWakeWord, with echo cancellation." },
      { icon: "🗣️", title: "Speech on the laptop", text: "faster-whisper hears you and Piper speaks back. A cloud speed-up is optional." },
      { icon: "🧭", title: "Three-tier router", text: "Exact phrases in under a millisecond, then embeddings, and an LLM only when it has to." },
      { icon: "🛑", title: "Asks before it acts", text: "Every action is rated for risk. Anything irreversible waits for a yes, and silence is never consent." },
      { icon: "🇳🇵", title: "English and Nepali", text: "It understands romanised Nepali the way Whisper actually hears it, and replies in either." },
      { icon: "🔊", title: "Knows your voice", text: "A voiceprint check, so a stranger's voice can't give it orders." },
      { icon: "🧠", title: "Remembers", text: "Memories pulled from conversation, and corrections that stick." },
      { icon: "✋", title: "Hand gestures", text: "Turn and explode the 3D reactor with your hands, tracked locally by MediaPipe." },
    ],
    flow: {
      title: "The LLM is the exception, not the path",
      intro: "Most commands never reach a language model. Each stage hands over to the next only when it has to.",
      steps: [
        { label: "Microphone", sub: "PipeWire echo cancel" },
        { label: "Wake word", sub: "openWakeWord" },
        { label: "Turn taking", sub: "Silero VAD + smart-turn" },
        { label: "Speech to text", sub: "faster-whisper" },
        { label: "Router", sub: "phrases → embeddings → LLM" },
        { label: "Confidence gate", sub: "act, offer, or ask" },
        { label: "Skill + voice", sub: "137 skills · Piper" },
      ],
    },
    stack: [
      { group: "Core", techs: [{ name: "Python", icon: "logos:python" }, { name: "ONNX Runtime", icon: "simple-icons:onnx", color: "#005ced" }, { name: "Linux", icon: "logos:linux-tux" }, { name: "GNOME", icon: "simple-icons:gnome", color: "#4a86cf" }] },
      { group: "HUD", techs: [{ name: "Electron", icon: "logos:electron" }, { name: "Three.js", icon: "simple-icons:threedotjs", color: "#000000" }, { name: "JavaScript", icon: "logos:javascript" }] },
      { group: "Models", techs: [{ name: "Claude", icon: "simple-icons:claude", color: "#d97757" }, { name: "Gemini", icon: "simple-icons:googlegemini", color: "#8e75b2" }, { name: "OpenAI gpt-oss", icon: "simple-icons:openai", color: "#000000" }] },
    ],
  },
  {
    slug: "tally",
    name: "Tally",
    kind: "Attendance · Teams & schools",
    tagline: "Every present day plants a tree.",
    summary:
      "A modern, gamified attendance app for small teams and schools. Staff check in and out, with an optional GPS check that they're at the office, admins approve, and every present day grows a tree in the team's living forest, which follows the real time of day.",
    started: "May 29, 2026",
    platforms: ["web", "android"],
    accent: "#10b981",
    world: { bg: "#e6f4ff", tone: "light" },
    tile: { bg: "#ffffff", pad: 0.18 },
    on: { android: true, windows: true, linux: true },
    featured: false,
    stats: [
      { value: 2, label: "platforms" },
      { value: 3, label: "languages" },
      { value: 101, label: "commits" },
    ],
    links: [
      { label: "Open Tally", href: "https://tally.rajendrapandey.info.np", primary: true },
      { label: "Source", href: `${GH}/attendance-system` },
    ],
    phone: [
      { img: "tally/phone-home", title: "Check in", note: "Aarati checks in at 9:52, 7 m from the office, and her tree starts growing." },
      { img: "tally/phone-forest", title: "Her forest", note: "56 trees since August: overtime glows, a stump for each day missed." },
      { img: "tally/phone-admin-dashboard", title: "The admin's morning", note: "Four entries to review, five of eight in, 99% attendance." },
      { img: "tally/phone-approvals", title: "Approvals", note: "A leave request, an out-of-office check-in with a note, approved or rejected in one tap." },
      { img: "tally/phone-calendar", title: "The calendar", note: "September at a glance: on time, late, leave, holidays and Saturdays off." },
      { img: "tally/phone-wrapped", title: "2026 Wrapped", note: "The year in slides, from days showed up to trees planted." },
      { img: "tally/phone-login", title: "Sign in", note: "The Android app: email and password or Google, then your own workspace." },
    ],
    desktop: {
      os: ["windows", "linux"],
      screens: [
        { img: "tally/desk-staff-dashboard", title: "Check in", note: "The staff dashboard: in the office, checked in, break or check out, and who else is in today." },
        { img: "tally/desk-forest-fullscreen", title: "The forest", note: "Her year as a forest under the real season's sky, deer, foxes and rabbits included." },
        { img: "tally/desk-forest-3d", title: "In 3D", note: "The same forest as a low-poly world you can turn: mountains, river and weather." },
        { img: "tally/desk-admin-dashboard", title: "The admin's morning", note: "What needs review, who's in, who's late, and the attendance rate, on one page." },
        { img: "tally/desk-admin-approvals", title: "Approvals", note: "Leave, an out-of-office check-in, a weak GPS fix and a hand-entered day, each with its note." },
        { img: "tally/desk-calendar", title: "The calendar", note: "Every day of her September, coloured by how it went." },
        { img: "tally/desk-team-forest", title: "The team's forest", note: "Everyone's October in one forest, above the leaderboard." },
        { img: "tally/desk-web", title: "Sign in", note: "The same app as a PWA: staff submit, the admin approves, everyone stays in sync." },
      ],
    },
    features: [
      { icon: "🏢", title: "Workspaces", text: "A private workspace per organisation, with admins, staff, managers and custom roles." },
      { icon: "📍", title: "Check in, check out", text: "Breaks, half days, a late grace period, and a warning when you're outside the office radius." },
      { icon: "✅", title: "Approvals", text: "Admins verify each entry, or let it auto-approve. Disputes, comments and an audit log." },
      { icon: "🌲", title: "The living forest", text: "Trees grow with the hours worked, glow with overtime and wither on absences, under a real day and night sky." },
      { icon: "🏫", title: "School mode", text: "Class attendance sheets, a teacher dashboard and student import from CSV." },
      { icon: "📄", title: "Reports", text: "PDF and CSV exports, custom date ranges and a calendar file for your holidays." },
    ],
    flow: {
      title: "One app, web and Android",
      intro: "A platform layer hides the difference, so the same React code runs as a PWA and as a native app.",
      steps: [
        { label: "React app", sub: "PWA or Capacitor" },
        { label: "Platform layer", sub: "GPS, haptics, sign-in" },
        { label: "Cloud Functions", sub: "verified attendance writes" },
        { label: "Firestore", sub: "rules per workspace" },
      ],
    },
    stack: [
      { group: "App", techs: [{ name: "React", icon: "logos:react" }, { name: "Vite", icon: "logos:vitejs" }, { name: "Tailwind CSS", icon: "logos:tailwindcss-icon" }, { name: "Three.js", icon: "simple-icons:threedotjs", color: "#000000" }] },
      { group: "Cloud", techs: [{ name: "Firebase", icon: "logos:firebase-icon" }, { name: "Vercel", icon: "logos:vercel-icon" }, { name: "Capacitor", icon: "simple-icons:capacitor", color: "#119eff" }] },
    ],
  },
  {
    slug: "r-ai",
    name: "R-AI",
    kind: "Local AI · Portable",
    tagline: "A whole AI, in a folder you can carry.",
    summary:
      "An air-gapped, zero-dependency AI that runs from a USB stick, an SSD or an internal drive. Install once, then chat with local models, generate images with Stable Diffusion and attach images or PDFs, all without the internet. One shared folder serves Windows, macOS, Linux and Android, so each model is downloaded only once.",
    started: "Jun 03, 2026",
    platforms: ["windows", "linux", "macos", "android"],
    accent: "#9b72cb",
    world: { bg: "#171717", tone: "dark" },
    tile: { bg: "#ffffff", pad: 0.08 },
    on: { android: true, windows: true, linux: true },
    featured: false,
    stats: [
      { value: 4, label: "operating systems" },
      { value: 6, label: "desktop models" },
      { value: 0, label: "cloud calls" },
    ],
    links: [{ label: "Source", href: `${GH}/R-AI`, primary: true }],
    phone: [{ img: "r-ai/phone-chat", title: "From your phone", note: "The same interface on a phone, served by the copy running on the laptop or by llama.cpp built in Termux." }],
    desktop: {
      os: ["windows", "linux"],
      screens: [
        { img: "r-ai/desk-chat", title: "Chat", note: "Local models with streaming answers, Markdown and code, a temperature dial and a Think switch. The web toggle stays off." },
        { img: "r-ai/desk-image", title: "Image Studio", note: "Stable Diffusion with prompt, negative prompt, steps, CFG, size, seed and sampler. It loads once the chat engine steps aside." },
      ],
    },
    features: [
      { icon: "💬", title: "Chat, offline", text: "Local models through Ollama on the desktop, and llama.cpp compiled right on the phone." },
      { icon: "🖼️", title: "Images too", text: "Stable Diffusion with prompts, steps, size and seed, and a live progress bar." },
      { icon: "📎", title: "Attachments", text: "Drop in an image or a PDF and ask about it." },
      { icon: "🧠", title: "Think mode", text: "A live, expandable reasoning trace for models that think out loud." },
      { icon: "💾", title: "Runs anywhere", text: "One Shared folder for every OS. Plug the drive in, double-click, chat." },
      { icon: "📱", title: "From your phone", text: "Open it over Wi-Fi from a phone, guarded by a token for each install." },
    ],
    flow: {
      title: "Small, on purpose",
      intro: "A Python standard-library server is the only moving part between you and the model.",
      steps: [
        { label: "Launcher", sub: ".bat · .sh · .command · Termux" },
        { label: "Python server", sub: "standard library only" },
        { label: "Ollama / llama.cpp", sub: "text models" },
        { label: "stable-diffusion.cpp", sub: "images, taking turns on RAM" },
      ],
    },
    stack: [
      { group: "Runtime", techs: [{ name: "Python", icon: "logos:python" }, { name: "Ollama", icon: "simple-icons:ollama", color: "#000000" }] },
      { group: "Interface", techs: [{ name: "JavaScript", icon: "logos:javascript" }, { name: "HTML5", icon: "logos:html-5" }, { name: "CSS3", icon: "logos:css-3" }] },
      { group: "Runs on", techs: [{ name: "Windows", icon: "logos:microsoft-windows-icon" }, { name: "Linux", icon: "logos:linux-tux" }, { name: "macOS", icon: "logos:apple" }, { name: "Android", icon: "logos:android-icon" }] },
    ],
  },
  {
    slug: "vocabu",
    name: "Vocabu",
    kind: "Dictionary · Learning",
    tagline: "Look up a word. Hear it. Keep it.",
    summary:
      "A beginner-friendly dictionary and vocabulary app for Android and Windows. Search an English word for its phonetics, a simple meaning and examples, hear it spoken, save it, get a word of the day, or point the camera at a page and look up the words on it.",
    started: "Mar 20, 2026",
    platforms: ["android", "windows"],
    accent: "#2d8464",
    world: { bg: "#f6f8fb", tone: "light" },
    tile: { bg: "#2d8464", glyph: "vocabu" },
    on: { android: true, windows: true },
    featured: false,
    stats: [
      { value: 2, label: "platforms" },
      { value: 1, label: "codebase" },
      { value: 3, label: "free APIs" },
    ],
    links: [{ label: "Source", href: `${GH}/vocabu`, primary: true }],
    phone: [
      { img: "vocabu/phone-home", title: "Explore", note: "Search, the four learning paths and a carousel of words to explore, each with a meaning, an example and a speaker." },
      { img: "vocabu/phone-saved", title: "Saved words", note: "Everything you keep, stored in SQLite on the phone, ready offline." },
    ],
    features: [
      { icon: "🔎", title: "Search", text: "Phonetics, a simple meaning and examples for any English word." },
      { icon: "🔈", title: "Hear it", text: "Text to speech reads every word aloud." },
      { icon: "⭐", title: "Saved words", text: "Favourites and recent searches, stored in SQLite on the device." },
      { icon: "📅", title: "Word of the day", text: "A daily word, and random words to explore." },
      { icon: "📷", title: "Scan a page", text: "Photograph a page, pick the words you don't know, and look them all up at once." },
      { icon: "🌗", title: "Light and dark", text: "A green light theme and an orange dark one." },
    ],
    flow: {
      title: "Scan a page",
      intro: "From a photo of a book to a list of definitions, inside the free tiers.",
      steps: [
        { label: "Camera", sub: "capture the page" },
        { label: "Compress", sub: "under 1 MB" },
        { label: "OCR.space", sub: "text from the photo" },
        { label: "Word picker", sub: "skip the common words" },
        { label: "Dictionary API", sub: "rate-limited lookups" },
      ],
    },
    stack: [
      { group: "App", techs: [{ name: "Flutter", icon: "simple-icons:flutter", color: "#02569b" }, { name: "Dart", icon: "logos:dart" }, { name: "SQLite", icon: "simple-icons:sqlite", color: "#003b57" }] },
      { group: "Runs on", techs: [{ name: "Android", icon: "logos:android-icon" }, { name: "Windows", icon: "logos:microsoft-windows-icon" }] },
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
/** The project after this one, wrapping round, for the "next app" link. */
export const nextProject = (slug: string) => projects[(projects.findIndex((p) => p.slug === slug) + 1) % projects.length];
/** The app icon image, when there is one. */
export const iconOf = (p: Project) => (p.tile.glyph ? undefined : shot(`${p.slug}/icon`));

/**
 * Older work, under the launcher: the final-year project, shown as a washing
 * machine running the app's own order flow (components/proj/Laundry.tsx). Its
 * stages and features are the live app's, read from its front end.
 */
export const laundry = {
  name: "Laundry Recommendation App",
  repo: "laundry_recommendation_app",
  owner: "rajendra7169",
  text: "A MERN stack laundry management and recommendation web app: pick a laundry near you, order a wash, and follow it home on a map. My final-year project at Sunway College, Kathmandu.",
  date: "20 Sep 2024",
  href: `${GH}/laundry_recommendation_app`,
  live: "https://laundry-frontend-pearl.vercel.app",
  stack: [
    { name: "MongoDB", icon: "logos:mongodb-icon" },
    { name: "Express", icon: "simple-icons:express", color: "#1d2433" },
    { name: "React", icon: "logos:react" },
    { name: "Node.js", icon: "logos:nodejs-icon" },
    { name: "Stripe", icon: "simple-icons:stripe", color: "#635bff" },
    { name: "Leaflet", icon: "simple-icons:leaflet", color: "#199900" },
  ],
  // The wash cycle is the app's order, start to finish. `lcd` is what the machine's display reads.
  cycle: [
    { id: "order", lcd: "ORDER", label: "Order", title: "Order", text: "Choose a laundry and the type of clothes, add them to the cart, and pay cash on delivery or by card with Stripe." },
    { id: "pickup", lcd: "PICKUP", label: "Pickup", title: "Free pickup", text: "Schedule a pickup when it suits you; the shop collects from your door." },
    { id: "wash", lcd: "WASH+FOLD", label: "Wash", title: "Wash and fold", text: "Same-day or next-day service, express when you need it, and a free re-wash if you're not happy." },
    { id: "deliver", lcd: "ON THE WAY", label: "Delivery", title: "Out for delivery", text: "Track the order on a live map: where you are, where the shop is, and the road between." },
    { id: "done", lcd: "DELIVERED", label: "Done", title: "Delivered", text: "Every order and its status stays in your order history." },
  ],
};

/** The paper the project became, printed as the machine's receipt when the cycle ends. */
export const laundryPaper = {
  title: "Laundry Recommendation System Web Application using HTML, CSS, JS, NodeJS and MongoDB",
  where: "Google Drive",
  date: "20 Dec 2024",
  school: "Sunway College, Kathmandu",
};
