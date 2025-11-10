# Electron Build Guide

This guide explains how to build and distribute ComfyUI-Yesterday as a standalone Windows portable executable.

## Overview

The Electron build transforms the web application into a native Windows desktop application with:
- **System tray integration** - App runs in background
- **Native notifications** - Windows toast notifications for task events
- **Background task execution** - Scheduler continues running when window is hidden
- **Portable executable** - Single `.exe` file, no installation required
- **Persistent storage** - Data stored in user's AppData folder

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Windows 10/11 (for building Windows executables)
- ComfyUI running locally at `localhost:8188`

## Quick Start

### Development Mode

Run the app in Electron during development:

```bash
npm run electron:dev
```

This will:
1. Start the Vite dev server on port 3000
2. Launch Electron with hot-reload support
3. Open DevTools automatically
4. Watch for file changes

### Production Build

Build the portable Windows executable:

```bash
npm run electron:build:portable
```

This will:
1. Build the React app with Vite
2. Package everything with Electron
3. Create a portable `.exe` in `release/` directory

**Output**: `release/ComfyUI-Yesterday-1.0.0-portable.exe`

## Build Commands

### All Available Scripts

```bash
# Web development (browser)
npm run dev                    # Start Vite dev server

# Electron development
npm run electron:dev           # Run in Electron with hot-reload

# Production builds
npm run build                  # Build web app only
npm run electron:build         # Build Electron app (all formats)
npm run electron:build:win     # Build Windows installer + portable
npm run electron:build:portable # Build Windows portable only (recommended)
```

## Features

### System Tray

When you close the application window, it minimizes to the system tray in the Windows notification area.

**Tray Menu Options**:
- **Open ComfyUI-Yesterday** - Restore the main window
- **Scheduler Status** - View scheduler state and pending tasks
  - Running/Stopped indicator
  - Pending task count
  - Queue size
- **About** - Open the main window to About section
- **Quit** - Completely exit the application

**Interactions**:
- Single click - Show tray menu
- Double click - Restore main window
- Closing window - Minimize to tray (not quit)

### Background Processing

The scheduler continues to run even when:
- Window is minimized
- Window is hidden to tray
- Window is not visible

Tasks will execute at their scheduled time as long as the app is running in the background.

### Native Notifications

Windows toast notifications appear for:
- **Task completed** - Shows workflow name and execution time
- **Task failed** - Shows workflow name and error message
- **Task will be retried** - Shows retry count
- **Task missed** - Shows when a scheduled task was missed
- **App minimized** - Informs user the app is still running in tray

## App Icons

### Required Icons

Place these files in the `electron/` directory:

1. **icon.ico** - Main application icon (window, taskbar)
2. **tray-icon.png** - System tray icon (16x16 or 32x32 px)

See `electron/ICONS-README.md` for detailed icon requirements and creation guide.

### Using Default Icons

If icons are not provided, the app will use:
- Default Electron icon for the main window
- Generic system icon for the tray

## Build Configuration

The build is configured in `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.mushroomfleet.comfyui-yesterday",
    "productName": "ComfyUI-Yesterday",
    "directories": {
      "buildResources": "electron",
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": {
      "target": "portable",
      "icon": "electron/icon.ico"
    }
  }
}
```

### Customizing Build

Edit `package.json` build section to:
- Change app name or ID
- Add/remove target formats (portable, installer, zip)
- Modify output directory
- Add signing certificates (for production distribution)

## Distribution

### Portable Executable

The portable build creates a single `.exe` file that:
- Requires no installation
- Can run from any location (USB drive, cloud storage, etc.)
- Stores data in `%APPDATA%/comfyui-yesterday`
- Is ~150-200MB in size (includes Chromium)

### Sharing the App

To distribute to other users:

1. Build the portable executable:
   ```bash
   npm run electron:build:portable
   ```

2. Share the file from `release/` directory:
   ```
   release/ComfyUI-Yesterday-1.0.0-portable.exe
   ```

3. Users simply:
   - Download the `.exe` file
   - Double-click to run
   - No installation or admin rights needed

### Updates

To update the app:
1. Download the new `.exe` version
2. Close the running app (Quit from tray menu)
3. Replace the old `.exe` with the new one
4. Launch the new version
5. All data is preserved in AppData

## Troubleshooting

### Build Issues

**Problem**: Build fails with "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm run electron:build:portable
```

**Problem**: Icon errors during build
```
# Remove icon references temporarily from electron/main.js
# Or provide placeholder icons
```

### Runtime Issues

**Problem**: App shows blank white screen
```
# Check if dist/ folder exists and has files
npm run build
npm run electron:build:portable
```

**Problem**: ComfyUI connection fails
```
# Ensure ComfyUI is running at localhost:8188
# Check CORS is enabled in ComfyUI
# Restart both ComfyUI and the Electron app
```

**Problem**: Scheduler not running in background
```
# Verify app is still in system tray
# Check Task Manager for "ComfyUI-Yesterday" process
# Scheduler status visible in tray menu
```

**Problem**: Notifications not showing
```
# Check Windows notification settings
# Settings > System > Notifications
# Enable notifications for ComfyUI-Yesterday
```

### Data & Storage

**Data Location**: `%APPDATA%\comfyui-yesterday`

**To reset all data**:
1. Quit the app
2. Delete: `C:\Users\YourName\AppData\Roaming\comfyui-yesterday`
3. Restart app

**To backup data**:
1. Quit the app
2. Copy: `C:\Users\YourName\AppData\Roaming\comfyui-yesterday`
3. Store backup safely

## Advanced Configuration

### Custom Port

If your ComfyUI runs on a different port:

1. Edit `src/services/comfyui.service.ts`
2. Change the base URL from `localhost:8188` to your port
3. Rebuild the app

### Auto-Start on Windows Boot

To make the app start automatically:

1. Press `Win + R`
2. Type `shell:startup` and press Enter
3. Create a shortcut to the `.exe` in this folder

### Multiple Instance Prevention

The app currently allows multiple instances. To prevent:

Edit `electron/main.cjs` and add at the top:
```javascript
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
```

## Development Tips

### Debugging Electron

While in dev mode (`npm run electron:dev`):
- DevTools open automatically
- Console logs appear in both terminal and DevTools
- Hot reload works for renderer process
- Main process changes require restart

### Testing Production Build Locally

```bash
# Build and test
npm run electron:build:portable
cd release
./ComfyUI-Yesterday-1.0.0-portable.exe
```

### Logging

Electron logs appear in:
- **Development**: Terminal and DevTools console
- **Production**: 
  - Main process: `%APPDATA%\comfyui-yesterday\logs`
  - Renderer process: DevTools (F12)

## Performance

### Startup Time
- **First launch**: ~3-5 seconds
- **Subsequent launches**: ~2-3 seconds

### Memory Usage
- **Idle**: ~100-150MB
- **Active**: ~150-250MB
- **With tasks running**: ~200-300MB

### Build Size
- **Portable .exe**: ~150-200MB
- **Installed**: ~300-350MB (with cache)

## Security Considerations

### Code Signing

For public distribution, consider code signing:

1. Obtain a code signing certificate
2. Add to `package.json`:
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

### Permissions

The app requests:
- File system access (for IndexedDB)
- Network access (for ComfyUI connection)
- Notification permissions (for toast notifications)

All data stays local - no external servers contacted.

## Future Enhancements

Planned features for future releases:
- [ ] Auto-update functionality
- [ ] Multiple ComfyUI server support
- [ ] Custom tray icon based on status
- [ ] Enhanced notification controls
- [ ] Scheduled task statistics in tray
- [ ] Quick actions from tray menu

## Support

For issues or questions:
- GitHub Issues: [ComfyUI-Yesterday Issues](https://github.com/MushroomFleet/ComfyUI-Yesterday/issues)
- Main README: [README.md](../README.md)
- Icon Guide: [electron/ICONS-README.md](../electron/ICONS-README.md)

## License

Same as main project - MIT License
