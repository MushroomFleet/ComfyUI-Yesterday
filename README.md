# ComfyUI Workflow Runner

A modern React + TypeScript web application for executing ComfyUI workflows with real-time progress monitoring and comprehensive API support.

![ComfyUI Workflow Runner](https://img.shields.io/badge/ComfyUI-API%20Compatible-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)

## 🌟 Features

- **📁 Workflow Upload**: Upload ComfyUI API format JSON workflows
- **⚡ Real-time Execution**: Execute workflows with live progress monitoring via WebSocket
- **🖼️ Image Management**: View and download generated images
- **🔄 Queue Management**: Full control over ComfyUI execution queue
- **📊 Complete API Coverage**: All 40+ ComfyUI API endpoints implemented
- **🎨 Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **🔍 Type Safety**: Full TypeScript support throughout

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **bun** package manager
- **ComfyUI** running locally ([GitHub](https://github.com/comfyanonymous/ComfyUI))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/MushroomFleet/comfy-flow-runner.git
cd comfy-flow-runner
```

### 2. Install Dependencies

```bash
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
bun run dev
```

The app will be available at: `http://localhost:3000`

## 📖 Usage Guide

### Exporting Workflows from ComfyUI

1. Create your workflow in the ComfyUI web interface
2. Click **"Save (API Format)"** button
3. Save the JSON file to your computer

### Running a Workflow

1. Open the ComfyUI Workflow Runner in your browser
2. Verify the connection status shows **🟢 Connected**
3. Click **"Upload Workflow JSON"** and select your exported workflow file
4. Review the workflow details (file name, node count)
5. Click **"Execute Workflow"** to start processing
6. Monitor real-time progress updates
7. View and download generated images when complete

## 🏗️ Project Structure

```
comfy-flow-runner/
├── src/
│   ├── components/          # React components
│   │   ├── FileUpload.tsx
│   │   ├── WorkflowExecutor.tsx
│   │   ├── ProgressMonitor.tsx
│   │   ├── ImageDisplay.tsx
│   │   └── ui/              # shadcn/ui components
│   ├── services/            # API and WebSocket services
│   │   ├── comfyui.service.ts
│   │   └── websocket.service.ts
│   ├── types/               # TypeScript type definitions
│   │   └── comfyui.types.ts
│   ├── pages/               # Route pages
│   └── lib/                 # Utilities
├── docs/                    # Documentation
│   ├── API-implementation-coverage.md
│   ├── comfyORG-APIroutes.md
│   └── initial-dev-handoff.md
└── public/                  # Static assets
```

## 🔌 API Implementation

This application implements **all ComfyUI API endpoints** for complete functionality:

### Core Endpoints (40+ total)

#### Execution & Queue Management
- `POST /prompt` - Submit workflows
- `GET /prompt` - Queue status
- `GET /queue` - Current queue state
- `POST /queue` - Manage queue
- `POST /interrupt` - Stop execution

#### History Management
- `GET /history` - All execution history
- `GET /history/{prompt_id}` - Specific prompt history
- `POST /history` - Clear/delete history

#### Node & Model Discovery
- `GET /object_info` - All node types
- `GET /object_info/{node_class}` - Specific node details
- `GET /models` - Available models
- `GET /models/{folder}` - Models in folder
- `GET /features` - Server capabilities
- `GET /system_stats` - System information
- `GET /embeddings` - Available embeddings
- `GET /extensions` - Registered extensions
- `GET /workflow_templates` - Template workflows

#### File Operations
- `POST /upload/image` - Upload images
- `POST /upload/mask` - Upload masks
- `GET /view` - View images
- Image download functionality

#### User Data Management
- `GET /userdata` - List user files
- `GET /v2/userdata` - Enhanced file listing
- `GET /userdata/{file}` - Get file
- `POST /userdata/{file}` - Upload file
- `DELETE /userdata/{file}` - Delete file
- `POST /userdata/{file}/move/{dest}` - Move file

#### Additional Features
- User management (multi-user mode)
- Memory management
- WebSocket real-time updates

📚 **Full API Documentation**: See [API-implementation-coverage.md](docs/API-implementation-coverage.md)

## 🛠️ Configuration

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

## 🔧 Technology Stack

### Core Technologies
- **React** 18.3 - UI framework
- **TypeScript** 5.8 - Type safety
- **Vite** 5.4 - Build tool and dev server
- **React Router** 6.30 - Client-side routing

### UI Framework
- **shadcn/ui** - Component library
- **Radix UI** - Primitive components
- **Tailwind CSS** 3.4 - Utility-first CSS
- **Lucide React** - Icon system

### State & Data
- **TanStack Query** 5.83 - Server state management
- **React Hook Form** 7.61 - Form handling
- **Zod** 3.25 - Schema validation

### Additional Libraries
- **date-fns** - Date utilities
- **recharts** - Charts and visualization
- **sonner** - Toast notifications
- **cmdk** - Command menu

## 🐛 Troubleshooting

### Connection Issues

#### Problem: App shows "Disconnected"

**Solutions:**

1. **Verify ComfyUI is running**
   ```bash
   curl http://localhost:8188/system_stats
   ```
   Should return JSON data.

2. **Check CORS configuration**
   - ComfyUI CORS origin must match your app's URL exactly
   - Use `localhost` consistently (not `127.0.0.1`)

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
- Check firewall settings
- Ensure no other application is using port 8188

### Images Not Displaying

**Possible Causes:**
- Workflow doesn't have SaveImage nodes
- Wrong prompt_id reference
- ComfyUI output directory permissions

**Debug Steps:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify network requests to `/view` endpoint

### JSON Parse Error

**Problem:** Cannot upload workflow file

**Solutions:**
- Ensure you exported as "API Format" not "Workflow Format"
- Verify JSON file is valid
- Try re-exporting from ComfyUI

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📦 Deployment Options

### Static Hosting
- **Vercel**: `vercel`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Use `gh-pages` package
- **Cloudflare Pages**: Connect repository

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

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain type safety throughout
- Add comments for complex logic
- Update documentation when adding features
- Test with actual ComfyUI instance

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - The powerful AI workflow engine
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component system
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MushroomFleet/comfy-flow-runner/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MushroomFleet/comfy-flow-runner/discussions)
- **ComfyUI Docs**: [Official Documentation](https://github.com/comfyanonymous/ComfyUI)

## 🗺️ Roadmap

- [ ] Workflow parameter editor
- [ ] Batch processing support
- [ ] Workflow history tracking
- [ ] Custom node support documentation
- [ ] Multi-language support
- [ ] Theme customization
- [ ] Workflow templates library

---

**Made with ❤️ for the ComfyUI community**

## 📚 Citation

### Academic Citation

If you use this codebase in your research or project, please cite:

```bibtex
@software{comfyui_yesterday,
  title = {ComfyUI Yesterday: scheduling local api},
  author = {[Drift Johnson]},
  year = {2025},
  url = {https://github.com/MushroomFleet/ComfyUI-Yesterday},
  version = {1.0.0}
}
```

### Donate:


[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)
