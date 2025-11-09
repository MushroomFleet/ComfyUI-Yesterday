# ComfyUI-Yesterday

> Calendar-based scheduling tool for ComfyUI workflows with workflow library management

A modern React application that extends ComfyUI with calendar-based scheduling and workflow library management. Schedule your AI content generation in advance with a beautiful, minimalist interface.

![ComfyUI Compatible](https://img.shields.io/badge/ComfyUI-API%20Compatible-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## ✨ Features

### 📚 Workflow Library Management
- **Upload & Organize**: Store ComfyUI API workflow JSON files in your library
- **Custom Tagging**: Tag workflows by task type, media format, model name, and more
- **Smart Filtering**: Filter and search workflows using tag-based system
- **Full Management**: Rename, delete, and organize your workflow collection
- **Card-Based Display**: Beautiful grid layout with metadata and preview

### 📅 Calendar-Based Scheduler
- **Visual Interface**: Monthly calendar view for easy scheduling
- **Time Selection**: Schedule workflows to specific dates and times
- **Task Cards**: Color-coded appointment cards with status indicators
- **Drag & Drop**: Intuitive workflow assignment to calendar dates
- **Edit & Manage**: Modify or delete scheduled tasks with ease

### ⚡ Automatic Execution
- **Background Scheduler**: Continuously monitors for upcoming tasks
- **Auto-Execution**: Workflows run automatically at scheduled times
- **Real-time Updates**: Live progress monitoring via WebSocket
- **Queue Management**: Handle multiple concurrent tasks efficiently
- **Error Handling**: Automatic retry logic for failed executions
- **Status Tracking**: Visual indicators (pending → running → completed)

### 🎨 Beautiful UI
- **NSL Design System**: Dark purple/violet theme with golden accents
- **Smooth Animations**: Polished transitions and interactions
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: Real-time user feedback
- **Error Boundaries**: Graceful error handling

### 💾 Data Persistence
- **IndexedDB Storage**: All data stored locally in your browser
- **No Backend Required**: Fully client-side application
- **Fast Performance**: Optimized queries with Dexie.js
- **Data Export**: Backup your workflows and schedules

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **bun** package manager
- **ComfyUI** running locally ([GitHub](https://github.com/comfyanonymous/ComfyUI))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MushroomFleet/ComfyUI-Yesterday.git
cd ComfyUI-Yesterday
```

### 2. Install Dependencies

```bash
npm install
# or
bun install
```

### 3. Start ComfyUI with CORS

ComfyUI must be running with CORS enabled for the app to connect:

```bash
# Standard ComfyUI
python main.py --enable-cors-header http://localhost:3000

# Windows Standalone Build
.\python_embeded\python.exe -s ComfyUI\main.py --windows-standalone-build --listen 0.0.0.0 --enable-cors-header http://localhost:3000
```

### 4. Start the Development Server

```bash
npm run dev
# or
bun dev
```

The app will be available at: `http://localhost:3000`

## 📖 Usage Guide

### Step 1: Build Your Workflow Library

1. **Export workflows from ComfyUI**
   - Create your workflow in ComfyUI web interface
   - Click **"Save (API Format)"** button
   - Save the JSON file to your computer

2. **Add to Library**
   - Navigate to **API Flow Manager** page
   - Click **Upload Workflow** button
   - Select your exported JSON file
   - Add a descriptive name
   - Add tags (e.g., "t2i", "image", "SDXL", "portrait")
   - Optionally add a description
   - Click **Add to Library**

3. **Organize with Tags**
   - Use consistent tagging for easy filtering
   - Common tag categories: task type, media format, model name, style
   - Filter workflows using the tag panel

### Step 2: Schedule Workflows

1. **Open Calendar**
   - Navigate to **Calendar** page
   - View monthly calendar with any existing scheduled tasks

2. **Schedule a Workflow**
   - Click on a date in the calendar
   - Select a time slot (hour selection)
   - Choose a workflow from your library
   - Review the task details
   - Click **Schedule**

3. **Manage Scheduled Tasks**
   - Tasks appear as colored cards on calendar dates
   - Click task cards to view details
   - Edit or delete tasks as needed
   - Status colors indicate task state (pending, running, completed)

### Step 3: Automatic Execution

- **Scheduler runs automatically** in the background
- Tasks execute at their scheduled time (when app is open)
- **Real-time status updates** show progress
- **Notifications** inform you of completion or errors
- **View results** in task history or image gallery
- **Generated outputs** saved according to ComfyUI settings

### Additional Features

**Test Workflow**: Use the **Test Workflow** button in the header to quickly test new workflows without scheduling them.

**Task History**: View all past executions, including status, outputs, and any errors.

**Settings**: Configure scheduler behavior (check interval, concurrent tasks, retry logic).

## 🏗️ Project Structure

```
ComfyUI-Yesterday/
├── src/
│   ├── components/             # React components
│   │   ├── layout/            # Header, Sidebar, Layout
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── library/           # Workflow library components
│   │   │   ├── WorkflowCard.tsx
│   │   │   ├── WorkflowUploadModal.tsx
│   │   │   ├── WorkflowDetailModal.tsx
│   │   │   ├── TagFilterPanel.tsx
│   │   │   └── ...
│   │   ├── calendar/          # Calendar and scheduling
│   │   │   ├── CalendarView.tsx
│   │   │   ├── ScheduleTaskModal.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TimeSlotSelector.tsx
│   │   │   └── WorkflowSelector.tsx
│   │   ├── shared/            # Shared components
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── SkeletonCard.tsx
│   │   └── ui/                # shadcn/ui components
│   ├── pages/                 # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── WorkflowLibrary.tsx
│   │   ├── Calendar.tsx
│   │   ├── History.tsx
│   │   ├── Settings.tsx
│   │   └── TestWorkflow.tsx
│   ├── services/              # API and business logic
│   │   ├── comfyui.service.ts      # ComfyUI API wrapper
│   │   ├── websocket.service.ts    # WebSocket connection
│   │   ├── storage.service.ts      # IndexedDB operations
│   │   ├── scheduler.service.ts    # Task scheduler
│   │   ├── task-queue.service.ts   # Queue management
│   │   └── database.ts             # Dexie database setup
│   ├── hooks/                 # Custom React hooks
│   │   ├── useWorkflowLibrary.ts   # Workflow CRUD
│   │   ├── useScheduledTasks.ts    # Task CRUD
│   │   └── useScheduler.ts         # Scheduler control
│   ├── types/                 # TypeScript definitions
│   │   ├── comfyui.types.ts
│   │   ├── workflow-library.types.ts
│   │   └── scheduled-task.types.ts
│   ├── utils/                 # Utility functions
│   │   ├── error-messages.ts
│   │   └── test-data.ts
│   └── lib/                   # Shared utilities
│       └── utils.ts
├── docs/                      # Documentation
│   ├── API-implementation-coverage.md
│   ├── comfyORG-APIroutes.md
│   ├── initial-dev-handoff.md
│   └── yesterday/            # Development docs
│       ├── yesterday-INDEX.md
│       ├── yesterday-README.md
│       ├── yesterday-quickstart.md
│       └── yesterday-phase*.md
├── public/                    # Static assets
├── package.json
├── tailwind.config.ts        # Tailwind with NSL colors
├── vite.config.ts
└── README.md                 # This file
```

## 🎨 NSL Design System

ComfyUI-Yesterday uses the **NSL (Narrative Spittoon Inversion)** design system, featuring a sophisticated dark theme with purple and golden accents.

### Color Palette

**Primary Colors (Purple/Violet)**
- Primary: `hsl(263 70% 60%)` - Main brand color, buttons, links
- Primary Glow: `hsl(263 80% 70%)` - Hover states, glows, active elements

**Accent Colors (Golden)**
- Accent: `hsl(38 92% 50%)` - CTAs, highlights, important actions
- Accent Glow: `hsl(38 100% 60%)` - Hover states for accent elements

**Background Colors**
- Background: `hsl(250 24% 10%)` - Main dark background
- Card: `hsl(250 20% 14%)` - Elevated surfaces, cards
- Card Hover: `hsl(250 20% 16%)` - Interactive card hover state

### Status Colors

- **Pending**: `hsl(263 70% 60%)` (primary purple) - Task scheduled, waiting
- **Running**: `hsl(263 80% 70%)` (primary glow) - Currently executing
- **Completed**: `hsl(142 71% 45%)` (success green) - Successfully finished
- **Failed**: `hsl(0 72% 51%)` (destructive red) - Execution failed
- **Cancelled**: `hsl(250 10% 65%)` (muted gray) - User cancelled

### Typography & Effects

- **Font**: System font stack for optimal rendering
- **Shadows**: Elegant shadow system with glow effects
- **Animations**: Smooth transitions (200-300ms)
- **Border Radius**: Consistent rounded corners (0.5rem standard)

See [NSL Branding Guide](ref/nsl-app-branding-guidance.md) for complete design system documentation.

## 🔌 ComfyUI API Integration

ComfyUI-Yesterday implements **all ComfyUI API endpoints** for complete functionality:

### Core Endpoints (40+ total)

#### Execution & Queue Management
- `POST /prompt` - Submit workflows for execution
- `GET /prompt` - Get queue status
- `GET /queue` - Current queue state
- `POST /queue` - Manage queue (clear, delete items)
- `POST /interrupt` - Stop current execution

#### History Management
- `GET /history` - All execution history
- `GET /history/{prompt_id}` - Specific prompt history
- `POST /history` - Clear/delete history

#### Node & Model Discovery
- `GET /object_info` - All available node types
- `GET /object_info/{node_class}` - Specific node details
- `GET /models` - Available models
- `GET /embeddings` - Available embeddings
- `GET /extensions` - Registered extensions
- `GET /system_stats` - System information

#### File Operations
- `POST /upload/image` - Upload images
- `POST /upload/mask` - Upload masks
- `GET /view` - View/download generated images

#### Additional Features
- WebSocket real-time updates
- User data management
- Multi-user support

📚 **Full API Documentation**: See [API-implementation-coverage.md](docs/API-implementation-coverage.md)

## 🔧 Technology Stack

### Core Technologies
- **React** 18.3 - UI framework
- **TypeScript** 5.8 - Type safety
- **Vite** 5.4 - Build tool and dev server
- **React Router** 6.30 - Client-side routing

### UI Framework
- **shadcn/ui** - Component library
- **Radix UI** - Primitive components
- **Tailwind CSS** 3.4 - Utility-first CSS (NSL theme)
- **Lucide React** - Icon system

### State & Data Management
- **TanStack Query** 5.83 - Server state management
- **Dexie.js** 4.0 - IndexedDB wrapper
- **dexie-react-hooks** - React integration for Dexie
- **React Hook Form** 7.61 - Form handling
- **Zod** 3.25 - Schema validation

### Calendar & Scheduling
- **react-big-calendar** - Calendar UI component
- **date-fns** - Date manipulation and formatting

### Additional Libraries
- **uuid** - Unique ID generation
- **recharts** - Charts and visualization
- **sonner** - Toast notifications
- **cmdk** - Command menu

## ⚙️ Configuration

### Port Configuration

The app runs on port 3000 by default. To change this, edit `vite.config.ts`:

```typescript
server: {
  host: "::",
  port: 3000, // Change to your preferred port
}
```

**Important**: CORS configuration in ComfyUI must match your app's port!

### CORS Setup

ComfyUI must be started with the correct CORS origin:

```bash
# If app runs on port 3000
python main.py --enable-cors-header http://localhost:3000

# If app runs on port 8080
python main.py --enable-cors-header http://localhost:8080
```

### Scheduler Settings

Configure scheduler behavior in the Settings page:

- **Check Interval**: How often to check for due tasks (default: 60 seconds)
- **Concurrent Tasks**: Maximum simultaneous executions (default: 1)
- **Retry Attempts**: Maximum retries for failed tasks (default: 3)
- **Missed Task Behavior**: Action for missed tasks (execute immediately or mark as missed)

## 💾 Data Storage

ComfyUI-Yesterday uses **IndexedDB** for client-side data persistence via Dexie.js.

### Database: `ComfyUI-Yesterday`

**Store: workflowLibrary**
- Stores uploaded workflow JSON files with metadata
- Indexed by: id, name, createdAt, tags (multi-entry)
- Schema: WorkflowLibraryItem (see types/workflow-library.types.ts)

**Store: scheduledTasks**
- Stores scheduled workflow executions
- Indexed by: id, workflowId, scheduledTime, status
- Schema: ScheduledTask (see types/scheduled-task.types.ts)

### Data Persistence

- **Automatic**: All data saved automatically to IndexedDB
- **Local Only**: Data never leaves your browser
- **Persistent**: Data survives page refreshes and browser restarts
- **Private**: Each browser has its own isolated database

### Data Export/Import

Export your data for backup or transfer:

```javascript
// In browser console
const db = (await import('./services/database')).db;

// Export workflows
const workflows = await db.workflowLibrary.toArray();
console.log(JSON.stringify(workflows, null, 2));

// Export tasks
const tasks = await db.scheduledTasks.toArray();
console.log(JSON.stringify(tasks, null, 2));
```

## 🐛 Troubleshooting

### Connection Issues

#### Problem: App shows "Disconnected" from ComfyUI

**Solutions:**

1. **Verify ComfyUI is running**
   ```bash
   curl http://localhost:8188/system_stats
   ```
   Should return JSON data with system information.

2. **Check CORS configuration**
   - ComfyUI CORS origin must match your app's URL exactly
   - Use `localhost` consistently (not `127.0.0.1`)
   - Restart ComfyUI after changing CORS settings

3. **Verify port matching**
   - If app runs on port 3000, CORS must allow `http://localhost:3000`
   - If app runs on port 8080, CORS must allow `http://localhost:8080`

4. **Clear browser cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or restart dev server: `Ctrl+C` then `npm run dev`

### WebSocket Connection Failed

**Symptoms:** No real-time updates during execution

**Solutions:**
- Verify ComfyUI WebSocket is accessible at `ws://localhost:8188/ws`
- Check firewall/antivirus settings
- Ensure no other application is using port 8188
- Try restarting both ComfyUI and the app

### Scheduler Not Running Tasks

**Problem:** Tasks not executing at scheduled time

**Solutions:**
1. **Keep app open**: Scheduler only runs when browser tab is active
2. **Check scheduler status**: Verify scheduler is running in Settings
3. **Verify ComfyUI connection**: Scheduler requires active ComfyUI connection
4. **Check browser console**: Look for errors in DevTools (F12)
5. **Review task status**: Ensure task is in "pending" state

### Workflow Upload Issues

**Problem:** Cannot upload workflow JSON file

**Solutions:**
- Ensure exported as **"API Format"** not "Workflow Format" in ComfyUI
- Verify JSON file is valid (use JSONLint or similar)
- Check file size (max 10MB recommended)
- Try re-exporting from ComfyUI
- Check browser console for specific error messages

### Images Not Displaying

**Possible Causes:**
- Workflow doesn't contain SaveImage nodes
- Wrong prompt_id reference
- ComfyUI output directory permissions
- Image path configuration

**Debug Steps:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify network requests to `/view` endpoint succeed
4. Check ComfyUI output folder has generated images
5. Verify SaveImage nodes are in workflow

### IndexedDB Issues

**Problem:** Data not persisting or database errors

**Solutions:**
- **Not in private/incognito mode**: IndexedDB disabled in private browsing
- **Check storage quota**: Browser may have run out of storage space
- **Clear database**: DevTools → Application → Storage → IndexedDB → Delete
- **Try different browser**: Some browsers have stricter IndexedDB policies
- **Check browser support**: Ensure browser supports IndexedDB (all modern browsers do)

### JSON Parse Error

**Problem:** Error when uploading or scheduling workflows

**Solutions:**
- Verify workflow JSON is valid
- Check for special characters or encoding issues
- Try re-exporting workflow from ComfyUI
- Open JSON in text editor to inspect for corruption

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Production Considerations

- **Browser Tab Must Stay Open**: Scheduler only runs when app is active
- **Consider Electron**: For always-on scheduling, consider wrapping in Electron
- **Data Backup**: Export workflow library and schedules periodically
- **ComfyUI Availability**: Ensure ComfyUI server remains accessible

## 📦 Deployment Options

### Static Hosting
- **Vercel**: `vercel` or connect GitHub repository
- **Netlify**: Drag & drop `dist/` folder or GitHub integration
- **GitHub Pages**: Use `gh-pages` package
- **Cloudflare Pages**: Connect repository for automatic deployments

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t comfyui-yesterday .
docker run -p 80:80 comfyui-yesterday
```

## 🧪 Development

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Project Setup

```bash
# Clone repository
git clone https://github.com/MushroomFleet/ComfyUI-Yesterday.git
cd ComfyUI-Yesterday

# Install dependencies
npm install

# Start development
npm run dev
```

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain type safety throughout
- Comment complex logic
- Follow existing component patterns
- Use NSL design system colors and styles

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code style and TypeScript patterns
4. Add tests for new features
5. Update documentation as needed
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- Maintain type safety throughout
- Follow NSL design system for UI components
- Test with actual ComfyUI instance
- Update documentation when adding features
- Add comments for complex logic
- Ensure backward compatibility

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - The powerful AI workflow engine that makes this possible
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible component system
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI primitives
- [Dexie.js](https://dexie.org/) - Elegant IndexedDB wrapper for data persistence
- [react-big-calendar](https://github.com/jquense/react-big-calendar) - Calendar component
- NSL Design System - Consistent, beautiful branding

## 🔗 Related Projects

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - The base ComfyUI workflow engine
- [comfy-flow-runner-basic](https://github.com/MushroomFleet/comfy-flow-runner-basic) - Basic ComfyUI workflow runner (predecessor)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MushroomFleet/ComfyUI-Yesterday/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MushroomFleet/ComfyUI-Yesterday/discussions)
- **ComfyUI Docs**: [Official Documentation](https://github.com/comfyanonymous/ComfyUI)
- **Documentation**: See [docs/yesterday/](docs/yesterday/) for detailed development guides

## 🗺️ Roadmap

### Version 1.0 (Current) ✅
- ✅ Workflow library management with tagging
- ✅ Calendar-based scheduling interface
- ✅ Automatic background task execution
- ✅ NSL design system implementation
- ✅ IndexedDB data persistence
- ✅ Real-time progress monitoring

### Future Enhancements

#### Version 1.1
- [ ] Workflow parameter editing (un-bake workflows)
- [ ] Enhanced task history with filtering and search
- [ ] Workflow templates library
- [ ] Import/export workflow collections

#### Version 1.2
- [ ] Recurring tasks (daily, weekly, monthly schedules)
- [ ] Batch scheduling (multiple tasks at once)
- [ ] Task templates and presets
- [ ] Advanced queue management

#### Version 2.0
- [ ] Electron app wrapper (always-on scheduling)
- [ ] Multi-ComfyUI server support
- [ ] Cloud sync (optional, user data backup)
- [ ] Mobile companion app (React Native)

#### Future Considerations
- [ ] Team collaboration features
- [ ] Workflow marketplace/sharing
- [ ] Advanced analytics and insights
- [ ] Custom node support documentation
- [ ] Multi-language support
- [ ] Theme customization engine

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: November 2025

ComfyUI-Yesterday is production-ready for single-user, local ComfyUI instances. The application provides a complete solution for scheduling and managing ComfyUI workflows through an intuitive calendar interface.

---

**Made with ❤️ for the ComfyUI community**

*Schedule your creative future with ComfyUI-Yesterday* 🎨⏰📅
