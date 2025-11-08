import React, { useState, useEffect, useCallback } from 'react';
import { FileUpload } from '../components/FileUpload';
import { WorkflowExecutor } from '../components/WorkflowExecutor';
import { ProgressMonitor } from '../components/ProgressMonitor';
import { ImageDisplay } from '../components/ImageDisplay';
import { ComfyUIService } from '../services/comfyui.service';
import { WebSocketService } from '../services/websocket.service';
import { 
  Workflow, 
  ExecutionStatus, 
  ImageOutput,
  WSMessage 
} from '../types/comfyui.types';
import { Zap, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { PageTransition } from '@/components/shared/PageTransition';

const TestWorkflow = () => {
  const [comfyService] = useState(() => new ComfyUIService());
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
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
  }, [comfyService]);

  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'executing':
        if (message.data.node === null) {
          setExecutionStatus(prev => ({
            ...prev,
            isExecuting: false,
            currentNode: null
          }));
          
          if (currentPromptId) {
            fetchExecutionResults(currentPromptId);
          }
        } else {
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

  useEffect(() => {
    if (!wsService) return;

    const unsubscribe = wsService.subscribe(handleWebSocketMessage);
    return unsubscribe;
  }, [wsService, handleWebSocketMessage]);

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
    <PageTransition>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Test Workflow</h1>
          <p className="text-muted-foreground mt-1">
            Execute workflows with real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Disconnected</span>
            </> 
          )}
        </div>
      </div>

      {!isConnected && executionStatus.error && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            {executionStatus.error}
            <br />
            <span className="text-xs mt-2 block">
              Make sure ComfyUI is running with CORS enabled: <code className="bg-destructive/10 px-1 rounded">python main.py --cors-allow-origins http://localhost:8080</code>
            </span>
          </AlertDescription>
        </Alert>
      )}

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
      </div>
    </PageTransition>
  );
};

export default TestWorkflow;
