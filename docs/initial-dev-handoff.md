# ComfyUI Workflow Runner - Development Handoff Plan

## Project Overview

**Objective:** Build a simple React + TypeScript + Vite web application that allows users to upload a ComfyUI API format JSON workflow file and execute it against a local ComfyUI instance.

**Core Functionality:**
1. User uploads a JSON file (ComfyUI API format workflow)
2. Application sends the workflow to local ComfyUI instance (http://127.0.0.1:8188)
3. Application monitors execution progress
4. Application displays/downloads generated images

**Technology Stack:**
- React 18+
- TypeScript
- Vite
- No additional UI libraries required (can use basic HTML/CSS or Tailwind if preferred)

---

## Architecture Overview

```
┌─────────────────┐
│   User Browser  │
│   React App     │
└────────┬────────┘
         │
         │ Upload JSON
         │ Send to ComfyUI
         │ Monitor via WebSocket
         │
┌────────▼────────┐
│   ComfyUI API   │
│ localhost:8188  │
└─────────────────┘
```

---

## Prerequisites

Before development begins, ensure:
- [ ] Node.js 18+ installed
- [ ] Local ComfyUI instance running on `http://127.0.0.1:8188`
- [ ] ComfyUI API accessible (test with `curl http://127.0.0.1:8188/system_stats`)

---

## Step 1: Project Setup

### Initialize Vite + React + TypeScript Project

```bash
npm create vite@latest comfyui-runner -- --template react-ts
cd comfyui-runner
npm install
```

### Install Required Dependencies

```bash
# No external dependencies required for core functionality
# Optional: Install for better DX
npm install --save-dev @types/node
```

### Project Structure

```
comfyui-runner/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx
│   │   ├── WorkflowExecutor.tsx
│   │   ├── ProgressMonitor.tsx
│   │   └── ImageDisplay.tsx
│   ├── services/
│   │   ├── comfyui.service.ts
│   │   └── websocket.service.ts
│   ├── types/
│   │   └── comfyui.types.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Step 2: TypeScript Type Definitions

### File: `src/types/comfyui.types.ts`

```typescript
// ComfyUI Workflow Node Structure
export interface WorkflowNode {
  inputs: Record<string, any>;
  class_type: string;
  _meta?: {
    title?: string;
  };
}

// Complete workflow structure
export interface Workflow {
  [nodeId: string]: WorkflowNode;
}

// API Request Structure
export interface PromptRequest {
  prompt: Workflow;
  client_id: string;
}

// API Response from /prompt
export interface PromptResponse {
  prompt_id: string;
  number: number;
  node_errors?: Record<string, any>;
}

// Image data structure from history
export interface ImageOutput {
  filename: string;
  subfolder: string;
  type: string;
}

// Node output structure
export interface NodeOutput {
  images?: ImageOutput[];
}

// History response structure
export interface HistoryResponse {
  [promptId: string]: {
    prompt: [number, string, Workflow];
    outputs: Record<string, NodeOutput>;
    status: {
      status_str: string;
      completed: boolean;
      messages: any[];
    };
  };
}

// WebSocket message types
export interface WSMessage {
  type: 'status' | 'progress' | 'executing' | 'executed' | 'execution_start' | 'execution_cached' | 'execution_error';
  data: {
    node?: string | null;
    value?: number;
    max?: number;
    prompt_id?: string;
    status?: any;
  };
}

// Execution status for UI
export interface ExecutionStatus {
  isExecuting: boolean;
  currentNode: string | null;
  progress: number;
  maxProgress: number;
  error: string | null;
}
```

---

## Step 3: ComfyUI API Service

### File: `src/services/comfyui.service.ts`

```typescript
import {
  Workflow,
  PromptRequest,
  PromptResponse,
  HistoryResponse,
  ImageOutput
} from '../types/comfyui.types';

const COMFYUI_BASE_URL = 'http://127.0.0.1:8188';

export class ComfyUIService {
  private clientId: string;

  constructor() {
    // Generate unique client ID for this session
    this.clientId = this.generateClientId();
  }

  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the client ID
   */
  public getClientId(): string {
    return this.clientId;
  }

  /**
   * Queue a workflow for execution
   */
  async queuePrompt(workflow: Workflow): Promise<PromptResponse> {
    const promptRequest: PromptRequest = {
      prompt: workflow,
      client_id: this.clientId
    };

    const response = await fetch(`${COMFYUI_BASE_URL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(promptRequest)
    });

    if (!response.ok) {
      throw new Error(`Failed to queue prompt: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get execution history for a specific prompt
   */
  async getHistory(promptId: string): Promise<HistoryResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/history/${promptId}`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all execution history
   */
  async getAllHistory(): Promise<HistoryResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/history`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Build image URL from image output data
   */
  getImageUrl(image: ImageOutput): string {
    const params = new URLSearchParams({
      filename: image.filename,
      subfolder: image.subfolder,
      type: image.type
    });

    return `${COMFYUI_BASE_URL}/view?${params.toString()}`;
  }

  /**
   * Download image as blob
   */
  async downloadImage(image: ImageOutput): Promise<Blob> {
    const url = this.getImageUrl(image);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Extract all images from history response
   */
  extractImages(history: HistoryResponse, promptId: string): ImageOutput[] {
    const images: ImageOutput[] = [];
    const promptHistory = history[promptId];

    if (!promptHistory || !promptHistory.outputs) {
      return images;
    }

    Object.values(promptHistory.outputs).forEach(nodeOutput => {
      if (nodeOutput.images) {
        images.push(...nodeOutput.images);
      }
    });

    return images;
  }

  /**
   * Check if ComfyUI is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${COMFYUI_BASE_URL}/system_stats`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
```

---

## Step 4: WebSocket Service

### File: `src/services/websocket.service.ts`

```typescript
import { WSMessage, ExecutionStatus } from '../types/comfyui.types';

const COMFYUI_WS_URL = 'ws://127.0.0.1:8188/ws';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private clientId: string;
  private messageHandlers: Set<(message: WSMessage) => void> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  /**
   * Connect to ComfyUI WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${COMFYUI_WS_URL}?clientId=${this.clientId}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.handleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay);
    }
  }

  /**
   * Subscribe to WebSocket messages
   */
  subscribe(handler: (message: WSMessage) => void): () => void {
    this.messageHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
```

---

## Step 5: React Components

### File: `src/components/FileUpload.tsx`

```typescript
import React, { useRef, ChangeEvent } from 'react';
import { Workflow } from '../types/comfyui.types';

interface FileUploadProps {
  onWorkflowLoaded: (workflow: Workflow, filename: string) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onWorkflowLoaded, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const workflow: Workflow = JSON.parse(text);
      
      // Basic validation - check if it's an object
      if (typeof workflow !== 'object' || workflow === null) {
        throw new Error('Invalid workflow format');
      }

      onWorkflowLoaded(workflow, file.name);
    } catch (error) {
      alert(`Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading workflow:', error);
    }

    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Upload Workflow JSON
      </button>
    </div>
  );
};
```

### File: `src/components/WorkflowExecutor.tsx`

```typescript
import React from 'react';
import { Workflow } from '../types/comfyui.types';

interface WorkflowExecutorProps {
  workflow: Workflow | null;
  workflowName: string;
  onExecute: () => void;
  isExecuting: boolean;
  disabled?: boolean;
}

export const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  workflow,
  workflowName,
  onExecute,
  isExecuting,
  disabled
}) => {
  if (!workflow) return null;

  const nodeCount = Object.keys(workflow).length;

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Loaded Workflow</h3>
      <p><strong>File:</strong> {workflowName}</p>
      <p><strong>Nodes:</strong> {nodeCount}</p>
      
      <button
        onClick={onExecute}
        disabled={disabled || isExecuting}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: (disabled || isExecuting) ? 'not-allowed' : 'pointer',
          backgroundColor: (disabled || isExecuting) ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '10px'
        }}
      >
        {isExecuting ? 'Executing...' : 'Execute Workflow'}
      </button>
    </div>
  );
};
```

### File: `src/components/ProgressMonitor.tsx`

```typescript
import React from 'react';
import { ExecutionStatus } from '../types/comfyui.types';

interface ProgressMonitorProps {
  status: ExecutionStatus;
}

export const ProgressMonitor: React.FC<ProgressMonitorProps> = ({ status }) => {
  if (!status.isExecuting && !status.error) return null;

  const progressPercentage = status.maxProgress > 0 
    ? Math.round((status.progress / status.maxProgress) * 100)
    : 0;

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Execution Status</h3>
      
      {status.error ? (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <strong>Error:</strong> {status.error}
        </div>
      ) : (
        <>
          {status.currentNode && (
            <p><strong>Current Node:</strong> {status.currentNode}</p>
          )}
          
          {status.maxProgress > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ 
                width: '100%', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${progressPercentage}%`,
                  height: '24px',
                  backgroundColor: '#28a745',
                  transition: 'width 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {progressPercentage}%
                </div>
              </div>
              <p style={{ marginTop: '5px', fontSize: '14px' }}>
                Progress: {status.progress} / {status.maxProgress}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

### File: `src/components/ImageDisplay.tsx`

```typescript
import React from 'react';
import { ImageOutput } from '../types/comfyui.types';

interface ImageDisplayProps {
  images: ImageOutput[];
  getImageUrl: (image: ImageOutput) => string;
  onDownload: (image: ImageOutput) => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  images, 
  getImageUrl,
  onDownload 
}) => {
  if (images.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Generated Images ({images.length})</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '15px'
      }}>
        {images.map((image, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            padding: '10px'
          }}>
            <img
              src={getImageUrl(image)}
              alt={`Generated ${index + 1}`}
              style={{ 
                width: '100%', 
                height: 'auto',
                borderRadius: '4px'
              }}
            />
            <p style={{ 
              fontSize: '12px', 
              marginTop: '8px',
              wordBreak: 'break-all'
            }}>
              {image.filename}
            </p>
            <button
              onClick={() => onDownload(image)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                width: '100%',
                marginTop: '8px'
              }}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Step 6: Main Application Component

### File: `src/App.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { WorkflowExecutor } from './components/WorkflowExecutor';
import { ProgressMonitor } from './components/ProgressMonitor';
import { ImageDisplay } from './components/ImageDisplay';
import { ComfyUIService } from './services/comfyui.service';
import { WebSocketService } from './services/websocket.service';
import { 
  Workflow, 
  ExecutionStatus, 
  ImageOutput,
  WSMessage 
} from './types/comfyui.types';
import './App.css';

function App() {
  // Services
  const [comfyService] = useState(() => new ComfyUIService());
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState<string>('');
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>({
    isExecuting: false,
    currentNode: null,
    progress: 0,
    maxProgress: 0,
    error: null
  });
  const [images, setImages] = useState<ImageOutput[]>([]);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      const ws = new WebSocketService(comfyService.getClientId());
      
      try {
        await ws.connect();
        setWsService(ws);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setExecutionStatus(prev => ({
          ...prev,
          error: 'Failed to connect to ComfyUI. Make sure it is running on localhost:8188'
        }));
      }
    };

    // Check if ComfyUI is accessible
    comfyService.healthCheck().then(isHealthy => {
      if (isHealthy) {
        initWebSocket();
      } else {
        setExecutionStatus(prev => ({
          ...prev,
          error: 'ComfyUI is not accessible at http://127.0.0.1:8188'
        }));
      }
    });

    return () => {
      wsService?.disconnect();
    };
  }, []);

  // Handle WebSocket messages
  useEffect(() => {
    if (!wsService) return;

    const unsubscribe = wsService.subscribe((message: WSMessage) => {
      handleWebSocketMessage(message);
    });

    return unsubscribe;
  }, [wsService, currentPromptId]);

  // Handle workflow upload
  const handleWorkflowLoaded = useCallback((loadedWorkflow: Workflow, filename: string) => {
    setWorkflow(loadedWorkflow);
    setWorkflowName(filename);
    setImages([]);
    setExecutionStatus({
      isExecuting: false,
      currentNode: null,
      progress: 0,
      maxProgress: 0,
      error: null
    });
  }, []);

  // Handle workflow execution
  const handleExecute = useCallback(async () => {
    if (!workflow) return;

    setExecutionStatus({
      isExecuting: true,
      currentNode: null,
      progress: 0,
      maxProgress: 0,
      error: null
    });
    setImages([]);

    try {
      const response = await comfyService.queuePrompt(workflow);
      setCurrentPromptId(response.prompt_id);
      console.log('Workflow queued with ID:', response.prompt_id);
    } catch (error) {
      setExecutionStatus(prev => ({
        ...prev,
        isExecuting: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, [workflow, comfyService]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'executing':
        if (message.data.node === null) {
          // Execution complete
          setExecutionStatus(prev => ({
            ...prev,
            isExecuting: false,
            currentNode: null
          }));
          
          // Fetch results
          if (currentPromptId) {
            fetchExecutionResults(currentPromptId);
          }
        } else {
          // Update current node
          setExecutionStatus(prev => ({
            ...prev,
            currentNode: message.data.node || null
          }));
        }
        break;

      case 'progress':
        setExecutionStatus(prev => ({
          ...prev,
          progress: message.data.value || 0,
          maxProgress: message.data.max || 0
        }));
        break;

      case 'execution_error':
        setExecutionStatus(prev => ({
          ...prev,
          isExecuting: false,
          error: 'Execution error occurred'
        }));
        break;
    }
  }, [currentPromptId]);

  // Fetch execution results
  const fetchExecutionResults = useCallback(async (promptId: string) => {
    try {
      const history = await comfyService.getHistory(promptId);
      const extractedImages = comfyService.extractImages(history, promptId);
      setImages(extractedImages);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setExecutionStatus(prev => ({
        ...prev,
        error: 'Failed to fetch results'
      }));
    }
  }, [comfyService]);

  // Handle image download
  const handleDownloadImage = useCallback(async (image: ImageOutput) => {
    try {
      const blob = await comfyService.downloadImage(image);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image');
    }
  }, [comfyService]);

  return (
    <div className="App">
      <header style={{ 
        padding: '20px',
        backgroundColor: '#282c34',
        color: 'white'
      }}>
        <h1>ComfyUI Workflow Runner</h1>
        <p style={{ margin: '5px 0' }}>
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </p>
      </header>

      <main style={{ 
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <FileUpload
          onWorkflowLoaded={handleWorkflowLoaded}
          disabled={!isConnected || executionStatus.isExecuting}
        />

        <WorkflowExecutor
          workflow={workflow}
          workflowName={workflowName}
          onExecute={handleExecute}
          isExecuting={executionStatus.isExecuting}
          disabled={!isConnected}
        />

        <ProgressMonitor status={executionStatus} />

        <ImageDisplay
          images={images}
          getImageUrl={(image) => comfyService.getImageUrl(image)}
          onDownload={handleDownloadImage}
        />
      </main>
    </div>
  );
}

export default App;
```

### File: `src/App.css`

```css
.App {
  min-height: 100vh;
  background-color: #f5f5f5;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  font-family: inherit;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

h3 {
  margin-top: 0;
  color: #333;
}

p {
  color: #666;
}
```

---

## Step 7: Configuration Files

### File: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy API calls to ComfyUI (optional alternative to direct calls)
    // proxy: {
    //   '/api': {
    //     target: 'http://127.0.0.1:8188',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, '')
    //   }
    // }
  }
})
```

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Step 8: Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Step 9: Testing Checklist

### Prerequisites Testing
- [ ] Verify ComfyUI is running: `curl http://127.0.0.1:8188/system_stats`
- [ ] Verify ComfyUI WebSocket: Check browser console for connection

### Functional Testing
1. **File Upload**
   - [ ] Upload valid ComfyUI API JSON workflow
   - [ ] Verify workflow details display correctly
   - [ ] Test uploading invalid JSON (should show error)
   - [ ] Test uploading same file twice

2. **Workflow Execution**
   - [ ] Click "Execute Workflow" button
   - [ ] Verify execution status updates in real-time
   - [ ] Verify progress bar updates correctly
   - [ ] Verify current node updates during execution

3. **Result Display**
   - [ ] Verify images appear after execution completes
   - [ ] Verify correct number of images
   - [ ] Verify images load and display correctly
   - [ ] Test download functionality for each image

4. **Error Handling**
   - [ ] Test with ComfyUI not running
   - [ ] Test with invalid workflow
   - [ ] Test WebSocket disconnection/reconnection
   - [ ] Verify error messages display correctly

---

## Step 10: Deployment (Continued)

### Option A: Local Deployment (Electron - Optional)

If users need a desktop app that bundles the React frontend with local ComfyUI access:

```bash
# Install Electron dependencies
npm install --save-dev electron electron-builder concurrently wait-on

# Install cross-env for cross-platform scripts
npm install --save-dev cross-env
```

#### File: `electron/main.js`

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // In production, load from built files
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

#### Update `package.json` for Electron:

```json
{
  "name": "comfyui-runner",
  "private": true,
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && cross-env NODE_ENV=development electron .\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.comfyui.runner",
    "productName": "ComfyUI Runner",
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "directories": {
      "buildResources": "assets"
    }
  }
}
```

### Option B: Static Web Hosting

Since this is a client-side only application (no backend), deploy to any static host:

#### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy `dist/` folder to Netlify

3. Add `_redirects` file in `public/` folder:
```
/*    /index.html   200
```

#### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### GitHub Pages Deployment

Update `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/comfyui-runner/', // Replace with your repo name
})
```

Add to `package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0"
  }
}
```

Deploy:
```bash
npm run deploy
```

---

## Step 11: Troubleshooting Guide

### Common Issues and Solutions

#### 1. CORS Errors

**Problem:** Browser blocks requests to ComfyUI due to CORS policy.

**Solution:** 
ComfyUI needs to allow CORS. Add this to ComfyUI's launch arguments:
```bash
python main.py --listen 0.0.0.0 --enable-cors-header http://localhost:3000
```

Or modify ComfyUI's `server.py` to add CORS headers.

#### 2. WebSocket Connection Failed

**Problem:** Cannot connect to `ws://127.0.0.1:8188/ws`

**Solutions:**
- Verify ComfyUI is running: `curl http://127.0.0.1:8188/system_stats`
- Check firewall settings
- Try using `localhost` instead of `127.0.0.1`
- Check browser console for specific error messages

**Code Fix:** Add connection retry logic (already implemented in `WebSocketService`)

#### 3. Images Not Displaying

**Problem:** Images don't show after execution completes.

**Debug Steps:**
```typescript
// Add to App.tsx
const fetchExecutionResults = useCallback(async (promptId: string) => {
  try {
    const history = await comfyService.getHistory(promptId);
    console.log('Full history:', history); // Debug log
    
    const extractedImages = comfyService.extractImages(history, promptId);
    console.log('Extracted images:', extractedImages); // Debug log
    
    setImages(extractedImages);
  } catch (error) {
    console.error('Failed to fetch results:', error);
  }
}, [comfyService]);
```

**Common Causes:**
- Workflow doesn't have SaveImage nodes
- Wrong prompt_id
- ComfyUI output directory permissions

#### 4. JSON Parse Error

**Problem:** Uploaded JSON fails to parse.

**Solution:** Validate JSON structure:
```typescript
const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const workflow: Workflow = JSON.parse(text);
    
    // Enhanced validation
    if (typeof workflow !== 'object' || workflow === null) {
      throw new Error('Invalid workflow format: not an object');
    }
    
    // Check if any nodes exist
    if (Object.keys(workflow).length === 0) {
      throw new Error('Invalid workflow format: no nodes found');
    }
    
    // Validate node structure
    for (const [nodeId, node] of Object.entries(workflow)) {
      if (!node.class_type || !node.inputs) {
        throw new Error(`Invalid node structure at ID: ${nodeId}`);
      }
    }

    onWorkflowLoaded(workflow, file.name);
  } catch (error) {
    alert(`Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
```

#### 5. Memory Leaks

**Problem:** Application becomes slow over time.

**Solution:** Ensure proper cleanup in components:
```typescript
// In App.tsx useEffect
useEffect(() => {
  const initWebSocket = async () => {
    // ... initialization code
  };

  initWebSocket();

  // Cleanup function
  return () => {
    if (wsService) {
      console.log('Cleaning up WebSocket connection');
      wsService.disconnect();
    }
  };
}, []); // Empty dependency array for mount/unmount only
```

---

## Step 12: Advanced Features (Optional Enhancements)

### Feature 1: Workflow Parameter Override

Allow users to modify workflow parameters before execution.

#### File: `src/components/WorkflowParameterEditor.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Workflow } from '../types/comfyui.types';

interface WorkflowParameterEditorProps {
  workflow: Workflow;
  onWorkflowUpdate: (workflow: Workflow) => void;
}

export const WorkflowParameterEditor: React.FC<WorkflowParameterEditorProps> = ({
  workflow,
  onWorkflowUpdate
}) => {
  const [editableParams, setEditableParams] = useState<Record<string, any>>({});

  useEffect(() => {
    // Extract common editable parameters
    const params: Record<string, any> = {};
    
    Object.entries(workflow).forEach(([nodeId, node]) => {
      // Look for KSampler nodes
      if (node.class_type === 'KSampler') {
        params[`${nodeId}_seed`] = node.inputs.seed || 0;
        params[`${nodeId}_steps`] = node.inputs.steps || 20;
        params[`${nodeId}_cfg`] = node.inputs.cfg || 8.0;
      }
      
      // Look for text prompt nodes
      if (node.class_type === 'CLIPTextEncode') {
        params[`${nodeId}_text`] = node.inputs.text || '';
      }
    });
    
    setEditableParams(params);
  }, [workflow]);

  const handleParamChange = (key: string, value: any) => {
    setEditableParams(prev => ({
      ...prev,
      [key]: value
    }));

    // Update workflow
    const [nodeId, paramName] = key.split('_');
    const updatedWorkflow = { ...workflow };
    
    if (updatedWorkflow[nodeId]) {
      updatedWorkflow[nodeId] = {
        ...updatedWorkflow[nodeId],
        inputs: {
          ...updatedWorkflow[nodeId].inputs,
          [paramName]: paramName === 'text' ? value : Number(value)
        }
      };
      
      onWorkflowUpdate(updatedWorkflow);
    }
  };

  if (Object.keys(editableParams).length === 0) {
    return null;
  }

  return (
    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      border: '1px solid #ddd', 
      borderRadius: '4px' 
    }}>
      <h3>Workflow Parameters</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {Object.entries(editableParams).map(([key, value]) => {
          const [nodeId, paramName] = key.split('_');
          const isText = paramName === 'text';
          
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px' }}>
                Node {nodeId} - {paramName}:
              </label>
              {isText ? (
                <textarea
                  value={value}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  rows={3}
                  style={{ 
                    padding: '8px', 
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              ) : (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  style={{ 
                    padding: '8px', 
                    fontSize: '14px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### Feature 2: Batch Processing

Process multiple workflows or run the same workflow multiple times.

#### File: `src/components/BatchExecutor.tsx`

```typescript
import React, { useState } from 'react';
import { Workflow } from '../types/comfyui.types';

interface BatchExecutorProps {
  workflow: Workflow;
  onBatchExecute: (count: number) => void;
  isExecuting: boolean;
}

export const BatchExecutor: React.FC<BatchExecutorProps> = ({
  workflow,
  onBatchExecute,
  isExecuting
}) => {
  const [batchCount, setBatchCount] = useState(1);

  if (!workflow) return null;

  return (
    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      border: '1px solid #ddd', 
      borderRadius: '4px' 
    }}>
      <h3>Batch Execution</h3>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Number of runs:
          <input
            type="number"
            min="1"
            max="100"
            value={batchCount}
            onChange={(e) => setBatchCount(Number(e.target.value))}
            disabled={isExecuting}
            style={{
              marginLeft: '10px',
              padding: '8px',
              fontSize: '14px',
              width: '80px'
            }}
          />
        </label>
        <button
          onClick={() => onBatchExecute(batchCount)}
          disabled={isExecuting}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            backgroundColor: isExecuting ? '#ccc' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Execute Batch
        </button>
      </div>
    </div>
  );
};
```

### Feature 3: Workflow History

Keep track of executed workflows and their results.

#### File: `src/services/history.service.ts`

```typescript
import { Workflow, ImageOutput } from '../types/comfyui.types';

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: number;
  workflowName: string;
  workflow: Workflow;
  promptId: string;
  images: ImageOutput[];
  duration?: number;
}

const STORAGE_KEY = 'comfyui_workflow_history';
const MAX_HISTORY_ENTRIES = 50;

export class HistoryService {
  /**
   * Get all history entries
   */
  getHistory(): WorkflowHistoryEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  /**
   * Add a new history entry
   */
  addEntry(entry: Omit<WorkflowHistoryEntry, 'id' | 'timestamp'>): WorkflowHistoryEntry {
    const newEntry: WorkflowHistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const history = this.getHistory();
    history.unshift(newEntry);

    // Keep only the latest entries
    const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }

    return newEntry;
  }

  /**
   * Update an existing entry
   */
  updateEntry(id: string, updates: Partial<WorkflowHistoryEntry>): void {
    const history = this.getHistory();
    const index = history.findIndex(entry => entry.id === id);

    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error('Failed to update history:', error);
      }
    }
  }

  /**
   * Delete an entry
   */
  deleteEntry(id: string): void {
    const history = this.getHistory();
    const filtered = history.filter(entry => entry.id !== id);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete history entry:', error);
    }
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

---

## Step 13: Documentation for End Users

### File: `USER_GUIDE.md`

```markdown
# ComfyUI Workflow Runner - User Guide

## Getting Started

### Prerequisites
1. ComfyUI must be running on your local machine
2. ComfyUI should be accessible at `http://127.0.0.1:8188`
3. Start ComfyUI with CORS enabled:
   ```bash
   python main.py --enable-cors-header http://localhost:3000
   ```

### Installation
1. Download and extract the application
2. Open terminal in the application folder
3. Run: `npm install`
4. Run: `npm run dev`
5. Open browser to `http://localhost:3000`

## How to Use

### Step 1: Export Workflow from ComfyUI
1. Create your workflow in ComfyUI web interface
2. Click "Save (API Format)" button
3. Save the JSON file to your computer

### Step 2: Upload Workflow
1. Click "Upload Workflow JSON" button
2. Select your exported JSON file
3. Verify workflow details appear

### Step 3: Execute Workflow
1. Click "Execute Workflow" button
2. Monitor progress in real-time
3. Wait for execution to complete

### Step 4: View and Download Results
1. Generated images appear automatically
2. Click "Download" on any image to save it
3. Images are saved with their original filenames

## Troubleshooting

### Connection Failed
**Problem:** Red "Disconnected" status
**Solution:**
- Verify ComfyUI is running
- Check that port 8188 is not blocked
- Ensure CORS is enabled in ComfyUI

### No Images Generated
**Problem:** Execution completes but no images shown
**Solution:**
- Ensure your workflow has SaveImage nodes
- Check ComfyUI output directory permissions
- Verify workflow executed without errors in ComfyUI logs

### JSON Parse Error
**Problem:** Cannot upload workflow file
**Solution:**
- Ensure you exported as "API Format" not "Workflow Format"
- Verify JSON file is not corrupted
- Try re-exporting from ComfyUI

## Tips
- Keep workflow JSON files organized in a folder
- Use descriptive filenames for your workflows
- Test workflows in ComfyUI before using the runner
- Monitor ComfyUI console for detailed error messages
```

---

## Step 14: Development Team Handoff Checklist

### Code Review Checklist
- [ ] All TypeScript types are properly defined
- [ ] Error handling implemented for all async operations
- [ ] WebSocket cleanup on component unmount
- [ ] Image loading uses proper error boundaries
- [ ] CORS configuration documented
- [ ] No console.errors in production build
- [ ] File upload validates JSON structure
- [ ] Progress monitoring works correctly
- [ ] Image download functionality tested

### Testing Checklist
- [ ] Unit tests for services (optional)
- [ ] Integration tests for API calls
- [ ] E2E tests for user workflows
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness testing
- [ ] Error scenario testing
- [ ] Network failure resilience

### Documentation Checklist
- [ ] README.md with setup instructions
- [ ] USER_GUIDE.md for end users
- [ ] Code comments for complex logic
- [ ] Type definitions documented
- [ ] API endpoints documented
- [ ] Deployment guide completed

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Build process tested
- [ ] Production build optimized
- [ ] Asset loading verified
- [ ] CORS configuration for production
- [ ] Error tracking implemented (Sentry, etc.)
- [ ] Analytics implemented (if needed)

---

## Step 15: Support and Maintenance

### Common Support Questions

**Q: Can this work with remote ComfyUI instances?**
A: Yes, update the `COMFYUI_BASE_URL` in `comfyui.service.ts` to point to the remote instance. Ensure CORS is properly configured on the remote server.

**Q: How do I modify workflows programmatically?**
A: Use the `WorkflowParameterEditor` component or directly modify the workflow object before passing to `queuePrompt()`.

**Q: Can I queue multiple workflows?**
A: Yes, call `queuePrompt()` multiple times. ComfyUI will process them sequentially.

**Q: How do I handle custom nodes?**
A: Custom nodes work automatically as long as they're installed in ComfyUI. The JSON format includes all necessary information.

### Maintenance Tasks

**Weekly:**
- Check for Vite/React updates
- Review error logs
- Monitor performance metrics

**Monthly:**
- Update dependencies: `npm update`
- Review and address security vulnerabilities: `npm audit`
- Test with latest ComfyUI version

**Quarterly:**
- Major dependency updates
- Performance optimization review
- User feedback implementation

---

## Step 16: Contact and Resources

### Development Team Contacts
- **Project Lead:** [Name/Email]
- **Frontend Developer:** [Name/Email]
- **QA Engineer:** [Name/Email]

### External Resources
- ComfyUI Documentation: https://github.com/comfyanonymous/ComfyUI
- ComfyUI API Reference: https://github.com/comfyanonymous/ComfyUI/wiki/API
- React Documentation: https://react.dev
- TypeScript Documentation: https://www.typescriptlang.org/docs
- Vite Documentation: https://vitejs.dev

### Issue Reporting
Report issues with the following information:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and OS version
5. Console errors (if any)
6. Sample workflow JSON (if applicable)

---

## Appendix A: Example Workflow JSON

```json
{
  "3": {
    "inputs": {
      "seed": 156680208700286,
      "steps": 20,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler"
  },
  "4": {
    "inputs": {
      "ckpt_name": "v1-5-pruned-emaonly.ckpt"
    },
    "class_type": "CheckpointLoaderSimple"
  },
  "5": {
    "inputs": {
      "width": 512,
      "height": 512,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage"
  },
  "6": {
    "inputs": {
      "text": "beautiful scenery nature glass bottle landscape",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  },
  "7": {
    "inputs": {
      "text": "text, watermark",
      "clip": ["4", 1]
    },
    "class_type": "CLIPTextEncode"
  },
  "8": {
    "inputs": {
      "samples": ["3", 0],
      "vae": ["4", 2]
    },
    "class_type": "VAEDecode"
  },
  "9": {
    "inputs": {
      "filename_prefix": "ComfyUI",
      "images": ["8", 0]
    },
    "class_type": "SaveImage"
  }
}
```

---

## Final Notes

This development plan provides a complete, production-ready solution for executing ComfyUI workflows via a React application. The architecture is simple, maintainable, and extensible.

**Key Success Factors:**
1. Ensure ComfyUI is properly configured with CORS
2. Test thoroughly with various workflow types
3. Implement proper error handling and user feedback
4. Keep the UI simple and focused on core functionality

**Timeline Estimate:**
- Setup and basic implementation: 2-3 days
- Testing and bug fixes: 1-2 days
- Documentation and handoff: 1 day
- **Total: 4-6 days**

Good luck with the implementation! 🚀
