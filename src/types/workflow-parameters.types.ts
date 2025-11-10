// src/types/workflow-parameters.types.ts

/**
 * Represents a seed parameter found in a workflow node
 */
export interface SeedParameter {
  nodeId: string;           // The node ID in the workflow
  nodeName: string;         // Display name from _meta.title or class_type
  currentValue: number;     // Current seed value
  parameterPath: string;    // The input key name (usually "seed")
}

/**
 * Represents a prompt parameter found in a workflow node
 */
export interface PromptParameter {
  nodeId: string;           // The node ID in the workflow
  nodeName: string;         // Display name from _meta.title or class_type
  currentValue: string;     // Current prompt text
  parameterPath: string;    // The input key name (usually "text")
}

/**
 * Parameter overrides that can be applied to a workflow
 * Used for task-level customization without modifying the library workflow
 */
export interface ParameterOverrides {
  randomizeSeeds: boolean;  // Global toggle - when true, generates new random seeds on each execution
  promptOverrides?: {
    [nodeId: string]: string;  // Map of node ID to new prompt text
  };
}

/**
 * Result of analyzing a workflow's editable parameters
 */
export interface WorkflowParameterAnalysis {
  seeds: SeedParameter[];
  prompts: PromptParameter[];
  hasSeedNodes: boolean;
  hasPromptNodes: boolean;
}

/**
 * Node types that contain seed parameters
 */
export const SEED_NODE_TYPES = [
  'KSampler',
  'KSamplerAdvanced',
  'SamplerCustom',
  'SamplerCustomAdvanced',
] as const;

/**
 * Node types that contain prompt/text parameters
 */
export const PROMPT_NODE_TYPES = [
  'CLIPTextEncode',
  'CLIPTextEncodeSDXL',
  'CLIPTextEncodeSDXLRefiner',
] as const;
