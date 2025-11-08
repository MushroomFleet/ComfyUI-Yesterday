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

// API Response from /prompt POST
export interface PromptResponse {
  prompt_id: string;
  number: number;
  node_errors?: Record<string, any>;
}

// API Response from /prompt GET - Queue status
export interface QueueStatusResponse {
  exec_info: {
    queue_remaining: number;
  };
}

// Queue item structure
export interface QueueItem {
  [0]: number; // queue position
  [1]: string; // prompt_id
  [2]: Workflow; // prompt
  [3]: { client_id: string }; // extra data
  [4]: string[]; // outputs
}

// Queue response structure
export interface QueueResponse {
  queue_running: QueueItem[];
  queue_pending: QueueItem[];
}

// Queue management request
export interface QueueManagementRequest {
  clear?: boolean;
  delete?: string[]; // array of prompt_ids
}

// History management request
export interface HistoryManagementRequest {
  clear?: boolean;
  delete?: string[]; // array of prompt_ids
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
  [key: string]: any;
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

// Node class info structure
export interface NodeClassInfo {
  input: {
    required?: Record<string, any>;
    optional?: Record<string, any>;
  };
  output: string[];
  output_is_list: boolean[];
  output_name: string[];
  name: string;
  display_name: string;
  description: string;
  category: string;
  output_node: boolean;
}

// Object info response
export interface ObjectInfoResponse {
  [nodeClass: string]: NodeClassInfo;
}

// System stats response
export interface SystemStatsResponse {
  system: {
    os: string;
    python_version: string;
    embedded_python: boolean;
  };
  devices: Array<{
    name: string;
    type: string;
    index: number;
    vram_total: number;
    vram_free: number;
    torch_vram_total: number;
    torch_vram_free: number;
  }>;
}

// Features response
export interface FeaturesResponse {
  [feature: string]: boolean | string | number;
}

// Models response
export interface ModelsResponse {
  [folder: string]: string[];
}

// Embeddings response
export interface EmbeddingsResponse {
  [embedding: string]: {
    path: string;
  };
}

// Extensions response
export interface ExtensionsResponse {
  [extension: string]: string; // extension name -> web directory path
}

// Workflow templates response
export interface WorkflowTemplatesResponse {
  [module: string]: string[]; // module name -> array of template names
}

// Model metadata response
export interface ModelMetadataResponse {
  [key: string]: any;
}

// User data file info
export interface UserDataFile {
  path: string;
  size: number;
  modified: number;
}

// User data directory info (v2)
export interface UserDataDirectory {
  files: UserDataFile[];
  directories: string[];
}

// User info response
export interface UserInfoResponse {
  username: string;
  [key: string]: any;
}

// Upload response
export interface UploadResponse {
  name: string;
  subfolder?: string;
  type?: string;
}

// Free memory request
export interface FreeMemoryRequest {
  unload_models: boolean;
  free_memory: boolean;
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
    sid?: string;
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
