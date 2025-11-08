# DJZ-Yesterday

> Calendar-based scheduling tool for ComfyUI workflows with workflow library management

A modern React application that extends ComfyUI with calendar-based scheduling and workflow library management. Schedule your AI content generation in advance with a beautiful, minimalist interface.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)

## ✨ Features

### 📚 API Flow Manager (Workflow Library)
- Upload and organize ComfyUI API workflow JSON files
- Custom tagging system (task type, media format, model name)
- Tag-based filtering and search
- Rename, delete, and manage workflows
- Card-based grid display with metadata

### 📅 Calendar-Based Scheduler
- Visual monthly calendar interface
- Schedule workflows to specific dates and times
- Task appointment cards with status indicators
- Drag-and-drop workflow assignment
- Edit and delete scheduled tasks

### ⚡ Automatic Execution
- Background scheduler monitors upcoming tasks
- Automatic workflow execution at scheduled times
- Real-time progress monitoring via WebSocket
- Queue management for multiple tasks
- Error handling with retry logic

### 🎨 Beautiful UI
- NSL design system (dark purple/violet theme with golden accents)
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Loading states and error boundaries
- Toast notifications for user feedback

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- ComfyUI running locally on port 8188
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MushroomFleet/ComfyUI-Yesterday.git
cd ComfyUI-Yesterday

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

The app will be available at: `http://localhost:3000`

### ComfyUI Setup

ComfyUI must be running with CORS enabled:

```bash
# Standard ComfyUI
python main.py --enable-cors-header http://localhost:3000

# Windows Standalone Build
.\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build --listen 0.0.0.0 --enable-cors-header http://localhost:3000
```

## 📖 Usage

### Adding Workflows to Library

1. Navigate to **API Flow Manager**
2. Click **Upload Workflow** button
3. Select a ComfyUI API format JSON file
4. Add a descriptive name
5. Add tags (e.g., "t2i", "image", "SDXL")
6. Optional: Add description
7. Click **Add to Library**

### Scheduling a Workflow

1. Navigate to **Calendar**
2. Click on a date in the calendar
3. Select a time slot
4. Choose a workflow from your library
5. Click **Schedule**
6. Task appears on calendar as appointment card

### Automatic Execution

- Scheduler runs in background
- Tasks execute automatically at scheduled time
- Real-time status updates (pending → running → completed)
- Notifications on completion or errors
- View generated outputs in task details

### Testing New Workflows

Use the **Test Workflow** button in the header to quickly test new workflows without scheduling them.

## 🏗️ Project Structure

```
comfyui-yesterday/
├── src/
│   ├── components/          # React components
│   │   ├── layout/         # Header, Sidebar, Layout
│   │   ├── library/        # Workflow library components
│   │   ├── calendar/       # Calendar and scheduling components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── WorkflowLibrary.tsx
│   │   ├── Calendar.tsx
│   │   ├── TaskHistory.tsx
│   │   └── Settings.tsx
│   ├── services/           # API and business logic
│   │   ├── comfyui.service.ts
│   │   ├── websocket.service.ts
│   │   ├── storage.service.ts
│   │   ├── scheduler.service.ts
│   │   └── database.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useWorkflowLibrary.ts
│   │   ├── useScheduledTasks.ts
│   │   └── useScheduler.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── workflow-library.types.ts
│   │   └── scheduled-task.types.ts
│   └── utils/              # Utility functions
├── docs/                   # Documentation
│   ├── Phase0.md          # Project overview
│   ├── Phase1.md          # Data models and storage
│   ├── Phase2.md          # API Flow Manager
│   ├── Phase3.md          # Calendar UI
│   ├── Phase4.md          # Scheduler engine
│   ├── Phase5.md          # Integration
│   ├── Phase6.md          # Polish and testing
│   ├── USER_GUIDE.md      # End-user documentation
│   └── DEVELOPMENT.md     # Developer guide
├── public/                 # Static assets
├── package.json
├── tailwind.config.ts     # Tailwind with NSL colors
├── vite.config.ts
└── README.md              # This file
```

## 🎨 Design System

DJZ-Yesterday uses the **NSL (Narrative Spittoon Inversion)** design system:

### Colors

- **Primary (Purple):** `hsl(263 70% 60%)` - Main brand color, buttons, links
- **Primary Glow:** `hsl(263 80% 70%)` - Hover states, glows
- **Accent (Golden):** `hsl(38 92% 50%)` - CTAs, highlights
- **Background:** `hsl(250 24% 10%)` - Dark theme base
- **Card:** `hsl(250 20% 14%)` - Elevated surfaces

### Status Colors

- **Pending:** Primary purple - Task scheduled, waiting
- **Running:** Primary glow - Currently executing
- **Completed:** Green `hsl(142 71% 45%)` - Successfully finished
- **Failed:** Red `hsl(0 72% 51%)` - Execution failed
- **Cancelled:** Muted gray - User cancelled

See [NSL Branding Guide](docs/nsl-app-branding-guidance.md) for complete design system.

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type safety
- **Vite 5.4** - Build tool and dev server
- **React Router 6.30** - Client-side routing

### UI & Styling
- **shadcn/ui** - Component library
- **Radix UI** - Primitive components
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Icon system

### State & Data
- **TanStack Query 5.83** - Server state management
- **Dexie.js** - IndexedDB wrapper
- **dexie-react-hooks** - React integration

### Calendar
- **react-big-calendar** - Calendar UI
- **date-fns** - Date manipulation

### Utilities
- **uuid** - Unique ID generation
- **Zod** - Schema validation
- **sonner** - Toast notifications

## 🔧 Configuration

### Port Configuration

Change the development server port in `vite.config.ts`:

```typescript
server: {
  host: "::",
  port: 3000, // Change to your preferred port
}
```

**Important:** CORS configuration in ComfyUI must match your app's port!

### Scheduler Settings

Configure scheduler behavior in Settings page:

- **Check Interval:** How often to check for due tasks (default: 60 seconds)
- **Concurrent Tasks:** Maximum number of tasks running simultaneously (default: 1)
- **Retry Attempts:** Maximum retries for failed tasks (default: 3)
- **Missed Task Behavior:** What to do with missed tasks (default: mark as missed)

## 📊 Data Storage

DJZ-Yesterday uses **IndexedDB** for client-side data persistence:

### Database: `DJZ-Yesterday`

**Store: workflowLibrary**
- Stores uploaded workflow JSON files
- Indexed by: id, name, createdAt, tags

**Store: scheduledTasks**
- Stores scheduled workflow executions
- Indexed by: id, workflowId, scheduledTime, status

### Data Export/Import

Export your workflows and tasks as JSON for backup or transfer:

```bash
# In browser console
const { db } = await import('./services/database');
const workflows = await db.workflowLibrary.toArray();
console.log(JSON.stringify(workflows));
```

## 🧪 Development

### Running Tests

```bash
# Unit tests
npm test

# Test storage layer
npm run test:storage

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

Build output will be in `dist/` directory.

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## 📝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style and TypeScript patterns
4. Add tests for new features
5. Update documentation
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🐛 Troubleshooting

### Connection Issues

**Problem:** Cannot connect to ComfyUI

**Solutions:**
1. Verify ComfyUI is running: `curl http://localhost:8188/system_stats`
2. Check CORS configuration matches app port
3. Use `localhost` consistently (not `127.0.0.1`)
4. Clear browser cache: `Ctrl+Shift+R`

### Task Execution Issues

**Problem:** Tasks not executing at scheduled time

**Solutions:**
1. Ensure app tab is open (browser may throttle background tabs)
2. Check scheduler is running in Settings
3. Verify ComfyUI is accessible
4. Check browser console for errors

### Workflow Upload Issues

**Problem:** Cannot upload workflow

**Solutions:**
1. Ensure workflow is exported as "API Format" not "Workflow Format"
2. Verify JSON file is valid
3. Check file size (max 10MB recommended)
4. Try re-exporting from ComfyUI

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more solutions.

## 📚 Documentation

- **[Phase 0 - Project Overview](docs/Phase0.md)** - Complete project architecture and planning
- **[Phase 1 - Data Layer](docs/Phase1.md)** - Storage and data model implementation
- **[User Guide](docs/USER_GUIDE.md)** - End-user documentation
- **[Development Guide](docs/DEVELOPMENT.md)** - Developer setup and guidelines
- **[API Documentation](docs/API.md)** - Service and hook documentation
- **[NSL Branding Guide](docs/nsl-app-branding-guidance.md)** - Design system reference

## 🗺️ Roadmap

### Current Version: 1.0.0
- ✅ Workflow library management
- ✅ Calendar-based scheduling
- ✅ Automatic task execution
- ✅ NSL design system

### Future Enhancements
- [ ] Workflow parameter editing (un-bake workflows)
- [ ] Batch scheduling (multiple tasks at once)
- [ ] Recurring tasks (daily, weekly, monthly)
- [ ] Task templates
- [ ] Cloud sync (optional)
- [ ] Mobile app (React Native)
- [ ] Electron app (always-on scheduling)
- [ ] Multi-ComfyUI server support
- [ ] Team collaboration features

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - The powerful AI workflow engine
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component system
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Dexie.js](https://dexie.org/) - Elegant IndexedDB wrapper
- NSL Design System - Consistent, beautiful branding

## 🔗 Related Projects

- [comfy-flow-runner-basic](https://github.com/MushroomFleet/comfy-flow-runner-basic) - The original ComfyUI workflow runner

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/MushroomFleet/ComfyUI-Yesterday/issues)
- **Discussions:** [GitHub Discussions](https://github.com/MushroomFleet/ComfyUI-Yesterday/discussions)
- **ComfyUI Docs:** [Official Documentation](https://github.com/comfyanonymous/ComfyUI)

---

**Made with ❤️ for the ComfyUI community**

*Schedule your creative future with DJZ-Yesterday* 🎨⏰
