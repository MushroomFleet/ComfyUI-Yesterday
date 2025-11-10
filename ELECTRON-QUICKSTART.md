# ComfyUI-Yesterday - Electron Quick Start

This document provides a quick overview of the Electron integration for ComfyUI-Yesterday.

## What's New

ComfyUI-Yesterday can now run as a native Windows desktop application with:

✅ **System Tray Integration** - Minimize to tray, keep running in background
✅ **Background Task Execution** - Scheduler continues running when window is hidden
✅ **Native Notifications** - Windows toast notifications for all task events
✅ **Portable Executable** - Single `.exe`, no installation required
✅ **Always-On Scheduling** - Tasks run even when window is minimized

## Quick Commands

```bash
# Development (run in Electron with hot-reload)
npm run electron:dev

# Build portable executable for Windows
npm run electron:build:portable

# Regular web development (browser)
npm run dev
```

## First-Time Setup

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start ComfyUI with CORS**:
   ```bash
   python main.py --enable-cors-header http://localhost:3000
   ```

3. **Run in Electron development mode**:
   ```bash
   npm run electron:dev
   ```

## Building for Distribution

To create the portable Windows executable:

```bash
npm run electron:build:portable
```

**Output**: `release/ComfyUI-Yesterday-1.0.0-portable.exe` (~150-200MB)

This file can be distributed to users who simply double-click to run.

## Key Features

### System Tray
- **Close window** → Minimizes to tray (doesn't quit)
- **Double-click tray icon** → Restore window
- **Right-click tray icon** → Show menu with:
  - Open ComfyUI-Yesterday
  - Scheduler Status (running, pending tasks, queue size)
  - Quit (actually exits the app)

### Background Operation
- Scheduler keeps running when window is:
  - Minimized
  - Hidden to tray
  - Not visible
- Tasks execute at scheduled time even in background
- Native Windows notifications for task events

### Notifications
Windows toast notifications appear for:
- Task completed
- Task failed
- Task retrying
- Task missed
- App minimized to tray

## App Icons (Optional)

For a professional look, add these icons to the `electron/` directory:

- **icon.ico** - Main app icon (256x256 recommended)
- **tray-icon.png** - Tray icon (16x16 or 32x32)

See `electron/ICONS-README.md` for detailed icon creation guide.

**Note**: The app works fine with default icons if you don't provide custom ones.

## File Structure

```
ComfyUI-Yesterday/
├── electron/                    # Electron-specific files
│   ├── main.cjs                # Main process (tray, window management)
│   ├── preload.cjs             # Secure IPC bridge
│   ├── ICONS-README.md         # Icon creation guide
│   ├── icon.ico                # App icon (you create this)
│   └── tray-icon.png           # Tray icon (you create this)
├── src/
│   ├── types/electron.d.ts     # TypeScript definitions
│   └── services/
│       └── scheduler.service.ts # Enhanced with Electron notifications
├── docs/
│   └── ELECTRON-BUILD.md       # Detailed build documentation
├── release/                     # Build output (created during build)
│   └── *.exe                   # Portable executable
└── package.json                # Updated with Electron scripts
```

## Documentation

- **Detailed Build Guide**: `docs/ELECTRON-BUILD.md`
- **Icon Creation Guide**: `electron/ICONS-README.md`
- **Main README**: `README.md`

## How It Works

1. **Main Process** (`electron/main.cjs`):
   - Creates application window
   - Manages system tray
   - Handles window minimize/restore
   - Intercepts close events to minimize to tray instead

2. **Preload Script** (`electron/preload.cjs`):
   - Secure bridge between main and renderer processes
   - Exposes safe APIs to React app
   - Handles IPC communication

3. **Scheduler Integration** (`src/services/scheduler.service.ts`):
   - Detects Electron environment
   - Sends status updates to tray
   - Triggers native notifications
   - Continues running in background

## Development vs Production

### Development Mode (`npm run electron:dev`)
- Runs Vite dev server
- Hot-reload enabled
- DevTools open automatically
- Console logs visible in terminal

### Production Build (`npm run electron:build:portable`)
- Optimized React build
- No DevTools by default
- Single portable executable
- ~150-200MB file size

## Common Usage Scenarios

### Scenario 1: Daily Batch Processing
1. Schedule workflows throughout the day
2. Minimize app to system tray
3. App runs tasks in background
4. Get notifications when tasks complete
5. Check results later

### Scenario 2: Overnight Rendering
1. Schedule resource-intensive workflows for night
2. Close window to tray before leaving
3. Tasks execute automatically overnight
4. Check results in the morning

### Scenario 3: Portable Installation
1. Build portable executable
2. Copy `.exe` to USB drive or cloud storage
3. Run from any Windows machine
4. All settings and data portable

## System Requirements

- **OS**: Windows 10/11 (x64)
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: ~300MB for app + space for ComfyUI outputs
- **ComfyUI**: Must be running at localhost:8188

## Troubleshooting

### App won't start
- Check if you have Node.js 18+ installed
- Try rebuilding: `npm install && npm run electron:build:portable`

### Tray icon missing
- Install optional icons (see `electron/ICONS-README.md`)
- Or ignore - app works fine with default icons

### Scheduler not running in background
- Verify app is in system tray (check notification area)
- Right-click tray → Check "Scheduler Status"
- Ensure ComfyUI is still running

### Build fails
```bash
# Clean install
rm -rf node_modules dist release
npm install
npm run electron:build:portable
```

## Next Steps

1. **Try development mode**: `npm run electron:dev`
2. **Test system tray**: Close window, check tray area
3. **Schedule a test task**: Verify background execution
4. **Build portable exe**: `npm run electron:build:portable`
5. **Test the executable**: Run the built `.exe` file

## Support

- **Issues**: [GitHub Issues](https://github.com/MushroomFleet/ComfyUI-Yesterday/issues)
- **Detailed Docs**: `docs/ELECTRON-BUILD.md`
- **Main Project**: `README.md`

---

**Ready to build?** Run: `npm run electron:build:portable`

**Want to test first?** Run: `npm run electron:dev`
