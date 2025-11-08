// src/types/workflow-library.types.ts

/**
 * Represents a workflow stored in the library
 */
export interface WorkflowLibraryItem {
  id: string;                    // UUID v4
  name: string;                  // Display name for the workflow
  fileName: string;              // Original filename when uploaded
  workflow: ComfyUIWorkflow;     // Complete ComfyUI API format JSON
  tags: string[];                // User-defined tags for organization
  createdAt: Date;               // When workflow was added to library
  updatedAt: Date;               // Last modification time
  metadata: WorkflowMetadata;    // Additional information
}

/**
 * Metadata about a workflow
 */
export interface WorkflowMetadata {
  nodeCount?: number;            // Number of nodes in workflow
  estimatedDuration?: number;    // Estimated execution time in seconds
  description?: string;          // User-provided description
  lastExecuted?: Date;           // Last time this workflow was executed
  executionCount?: number;       // Number of times executed
}

/**
 * ComfyUI workflow structure (from existing types)
 * This should match the API format from ComfyUI
 */
export interface ComfyUIWorkflow {
  [nodeId: string]: ComfyUINode;
}

/**
 * Individual node in ComfyUI workflow
 */
export interface ComfyUINode {
  class_type: string;
  inputs: Record<string, unknown>;
  _meta?: {
    title?: string;
  };
}

/**
 * Tag categories for organization
 */
export interface TagCategories {
  taskType: string[];      // e.g., ["t2i", "i2i", "video", "upscale"]
  mediaFormat: string[];   // e.g., ["image", "video", "audio"]
  modelName: string[];     // e.g., ["SDXL", "SD15", "Flux"]
  custom: string[];        // User-defined tags
}

/**
 * Common tag suggestions
 */
export const COMMON_TAGS = {
  taskType: ['t2i', 'i2i', 'video', 'upscale', 'animation', 'inpaint', 'outpaint'],
  mediaFormat: ['image', 'video', 'audio', 'batch'],
  modelName: ['SDXL', 'SD15', 'SD21', 'Flux', 'AnimateDiff', 'SVD'],
} as const;

/**
 * Input for creating a new workflow library item
 */
export interface CreateWorkflowInput {
  name: string;
  fileName: string;
  workflow: ComfyUIWorkflow;
  tags?: string[];
  description?: string;
}

/**
 * Input for updating a workflow library item
 */
export interface UpdateWorkflowInput {
  name?: string;
  tags?: string[];
  description?: string;
}
