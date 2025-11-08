import {
  Workflow,
  PromptRequest,
  PromptResponse,
  QueueStatusResponse,
  QueueResponse,
  QueueManagementRequest,
  HistoryResponse,
  HistoryManagementRequest,
  ImageOutput,
  ObjectInfoResponse,
  NodeClassInfo,
  SystemStatsResponse,
  FeaturesResponse,
  ModelsResponse,
  EmbeddingsResponse,
  ExtensionsResponse,
  WorkflowTemplatesResponse,
  ModelMetadataResponse,
  UserDataFile,
  UserDataDirectory,
  UserInfoResponse,
  UploadResponse,
  FreeMemoryRequest
} from '../types/comfyui.types';

const COMFYUI_BASE_URL = 'http://localhost:8188';

export class ComfyUIService {
  private clientId: string;

  constructor() {
    this.clientId = this.generateClientId();
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getClientId(): string {
    return this.clientId;
  }

  // ============================================================================
  // CORE EXECUTION & QUEUE MANAGEMENT
  // ============================================================================

  /**
   * Submit a workflow to the execution queue
   * POST /prompt
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
   * Get current queue status and execution information
   * GET /prompt
   */
  async getQueueStatus(): Promise<QueueStatusResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/prompt`);

    if (!response.ok) {
      throw new Error(`Failed to get queue status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get the current state of the execution queue
   * GET /queue
   */
  async getQueue(): Promise<QueueResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/queue`);

    if (!response.ok) {
      throw new Error(`Failed to get queue: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Manage queue operations (clear pending/running)
   * POST /queue
   */
  async manageQueue(request: QueueManagementRequest): Promise<void> {
    const response = await fetch(`${COMFYUI_BASE_URL}/queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to manage queue: ${response.statusText}`);
    }
  }

  /**
   * Stop the current workflow execution
   * POST /interrupt
   */
  async interrupt(): Promise<void> {
    const response = await fetch(`${COMFYUI_BASE_URL}/interrupt`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to interrupt execution: ${response.statusText}`);
    }
  }

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  /**
   * Get all queue history
   * GET /history
   */
  async getAllHistory(): Promise<HistoryResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/history`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get queue history for a specific prompt
   * GET /history/{prompt_id}
   */
  async getHistory(promptId: string): Promise<HistoryResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/history/${promptId}`);

    if (!response.ok) {
      throw new Error(`Failed to get history: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Clear history or delete specific history items
   * POST /history
   */
  async manageHistory(request: HistoryManagementRequest): Promise<void> {
    const response = await fetch(`${COMFYUI_BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to manage history: ${response.statusText}`);
    }
  }

  // ============================================================================
  // NODE & MODEL DISCOVERY
  // ============================================================================

  /**
   * Get details of all node types
   * GET /object_info
   */
  async getObjectInfo(): Promise<ObjectInfoResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/object_info`);

    if (!response.ok) {
      throw new Error(`Failed to get object info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get details of a specific node type
   * GET /object_info/{node_class}
   */
  async getNodeInfo(nodeClass: string): Promise<NodeClassInfo> {
    const response = await fetch(`${COMFYUI_BASE_URL}/object_info/${encodeURIComponent(nodeClass)}`);

    if (!response.ok) {
      throw new Error(`Failed to get node info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of available model types
   * GET /models
   */
  async getModels(): Promise<string[]> {
    const response = await fetch(`${COMFYUI_BASE_URL}/models`);

    if (!response.ok) {
      throw new Error(`Failed to get models: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get models in a specific folder
   * GET /models/{folder}
   */
  async getModelsInFolder(folder: string): Promise<string[]> {
    const response = await fetch(`${COMFYUI_BASE_URL}/models/${encodeURIComponent(folder)}`);

    if (!response.ok) {
      throw new Error(`Failed to get models in folder: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get server features and capabilities
   * GET /features
   */
  async getFeatures(): Promise<FeaturesResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/features`);

    if (!response.ok) {
      throw new Error(`Failed to get features: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get system stats (python version, devices, vram, etc)
   * GET /system_stats
   */
  async getSystemStats(): Promise<SystemStatsResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/system_stats`);

    if (!response.ok) {
      throw new Error(`Failed to get system stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of available embeddings
   * GET /embeddings
   */
  async getEmbeddings(): Promise<EmbeddingsResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/embeddings`);

    if (!response.ok) {
      throw new Error(`Failed to get embeddings: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of extensions registering a WEB_DIRECTORY
   * GET /extensions
   */
  async getExtensions(): Promise<ExtensionsResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/extensions`);

    if (!response.ok) {
      throw new Error(`Failed to get extensions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get map of custom node modules and associated template workflows
   * GET /workflow_templates
   */
  async getWorkflowTemplates(): Promise<WorkflowTemplatesResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/workflow_templates`);

    if (!response.ok) {
      throw new Error(`Failed to get workflow templates: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get metadata for a model
   * GET /view_metadata/{folder_name}
   */
  async getModelMetadata(folderName: string): Promise<ModelMetadataResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/view_metadata/${encodeURIComponent(folderName)}`);

    if (!response.ok) {
      throw new Error(`Failed to get model metadata: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  /**
   * Upload an image
   * POST /upload/image
   */
  async uploadImage(file: File, subfolder?: string, type?: string, overwrite?: boolean): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (subfolder) formData.append('subfolder', subfolder);
    if (type) formData.append('type', type);
    if (overwrite !== undefined) formData.append('overwrite', String(overwrite));

    const response = await fetch(`${COMFYUI_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upload a mask
   * POST /upload/mask
   */
  async uploadMask(file: File, originalRef?: string, subfolder?: string, type?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (originalRef) formData.append('original_ref', originalRef);
    if (subfolder) formData.append('subfolder', subfolder);
    if (type) formData.append('type', type);

    const response = await fetch(`${COMFYUI_BASE_URL}/upload/mask`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload mask: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get image URL for viewing
   * GET /view
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
   * Download an image as a blob
   */
  async downloadImage(image: ImageOutput): Promise<Blob> {
    const url = this.getImageUrl(image);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    return response.blob();
  }

  // ============================================================================
  // USER DATA MANAGEMENT
  // ============================================================================

  /**
   * List user data files in a specified directory
   * GET /userdata?dir={directory}
   */
  async listUserData(directory?: string): Promise<string[]> {
    const params = new URLSearchParams();
    if (directory) params.append('dir', directory);

    const response = await fetch(`${COMFYUI_BASE_URL}/userdata?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to list user data: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Enhanced version that lists files and directories in structured format
   * GET /v2/userdata?dir={directory}
   */
  async listUserDataV2(directory?: string): Promise<UserDataDirectory> {
    const params = new URLSearchParams();
    if (directory) params.append('dir', directory);

    const response = await fetch(`${COMFYUI_BASE_URL}/v2/userdata?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to list user data v2: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get a specific user data file
   * GET /userdata/{file}
   */
  async getUserDataFile(filePath: string): Promise<Blob> {
    const response = await fetch(`${COMFYUI_BASE_URL}/userdata/${encodeURIComponent(filePath)}`);

    if (!response.ok) {
      throw new Error(`Failed to get user data file: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Upload or update a user data file
   * POST /userdata/{file}
   */
  async uploadUserDataFile(filePath: string, file: File | Blob): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${COMFYUI_BASE_URL}/userdata/${encodeURIComponent(filePath)}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to upload user data file: ${response.statusText}`);
    }
  }

  /**
   * Delete a specific user data file
   * DELETE /userdata/{file}
   */
  async deleteUserDataFile(filePath: string): Promise<void> {
    const response = await fetch(`${COMFYUI_BASE_URL}/userdata/${encodeURIComponent(filePath)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user data file: ${response.statusText}`);
    }
  }

  /**
   * Move or rename a user data file
   * POST /userdata/{file}/move/{dest}
   */
  async moveUserDataFile(sourcePath: string, destPath: string): Promise<void> {
    const response = await fetch(
      `${COMFYUI_BASE_URL}/userdata/${encodeURIComponent(sourcePath)}/move/${encodeURIComponent(destPath)}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error(`Failed to move user data file: ${response.statusText}`);
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Get user information
   * GET /users
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/users`);

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new user (multi-user mode only)
   * POST /users
   */
  async createUser(username: string): Promise<UserInfoResponse> {
    const response = await fetch(`${COMFYUI_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username })
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  // ============================================================================
  // MEMORY MANAGEMENT
  // ============================================================================

  /**
   * Free memory by unloading specified models
   * POST /free
   */
  async freeMemory(request: FreeMemoryRequest): Promise<void> {
    const response = await fetch(`${COMFYUI_BASE_URL}/free`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to free memory: ${response.statusText}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Extract images from history response
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
   * Check if ComfyUI server is reachable
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
