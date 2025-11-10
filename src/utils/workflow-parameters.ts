// src/utils/workflow-parameters.ts

import { Workflow } from '../types/comfyui.types';
import {
  SeedParameter,
  PromptParameter,
  ParameterOverrides,
  WorkflowParameterAnalysis,
  SEED_NODE_TYPES,
  PROMPT_NODE_TYPES,
} from '../types/workflow-parameters.types';

/**
 * Extract all seed parameters from a workflow
 */
export function extractSeeds(workflow: Workflow): SeedParameter[] {
  const seeds: SeedParameter[] = [];

  Object.entries(workflow).forEach(([nodeId, node]) => {
    // Check if this node type contains seed parameters
    // Supports standard node types AND any node starting with "Zenkai"
    const isStandardSeedNode = SEED_NODE_TYPES.includes(node.class_type as any);
    const isZenkaiNode = node.class_type.startsWith('Zenkai');
    
    if (isStandardSeedNode || isZenkaiNode) {
      // Check if the node has a seed input
      if (typeof node.inputs?.seed === 'number') {
        seeds.push({
          nodeId,
          nodeName: node._meta?.title || node.class_type,
          currentValue: node.inputs.seed as number,
          parameterPath: 'seed',
        });
      }
    }
  });

  return seeds;
}

/**
 * Extract all prompt parameters from a workflow
 */
export function extractPrompts(workflow: Workflow): PromptParameter[] {
  const prompts: PromptParameter[] = [];

  Object.entries(workflow).forEach(([nodeId, node]) => {
    // Check if this node type contains prompt parameters
    if (PROMPT_NODE_TYPES.includes(node.class_type as any)) {
      // Check if the node has a text input
      if (typeof node.inputs?.text === 'string') {
        prompts.push({
          nodeId,
          nodeName: node._meta?.title || node.class_type,
          currentValue: node.inputs.text as string,
          parameterPath: 'text',
        });
      }
    }
  });

  return prompts;
}

/**
 * Analyze a workflow to find all editable parameters
 */
export function analyzeWorkflowParameters(workflow: Workflow): WorkflowParameterAnalysis {
  const seeds = extractSeeds(workflow);
  const prompts = extractPrompts(workflow);

  return {
    seeds,
    prompts,
    hasSeedNodes: seeds.length > 0,
    hasPromptNodes: prompts.length > 0,
  };
}

/**
 * Generate a random seed value for ComfyUI
 * ComfyUI nodes typically use signed 32-bit integers (0 to 2,147,483,647)
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}

/**
 * Apply parameter overrides to a workflow
 * Creates a deep copy and modifies seed and prompt values
 * @param workflow - The original workflow
 * @param overrides - The parameter overrides to apply
 * @returns A new workflow with overrides applied
 */
export function applyParameterOverrides(
  workflow: Workflow,
  overrides: ParameterOverrides
): Workflow {
  // Deep clone the workflow to avoid mutations
  const cloned: Workflow = JSON.parse(JSON.stringify(workflow));

  // Apply prompt overrides
  if (overrides.promptOverrides) {
    Object.entries(overrides.promptOverrides).forEach(([nodeId, newText]) => {
      const node = cloned[nodeId];
      if (node?.inputs?.text !== undefined) {
        node.inputs.text = newText;
      }
    });
  }

  // Apply seed randomization
  if (overrides.randomizeSeeds) {
    Object.entries(cloned).forEach(([nodeId, node]) => {
      // Check if this node has a seed parameter
      if (node.inputs?.seed !== undefined && typeof node.inputs.seed === 'number') {
        node.inputs.seed = generateRandomSeed();
      }
    });
  }

  return cloned;
}

/**
 * Validate prompt text
 * @param text - The prompt text to validate
 * @returns Object with isValid flag and optional error message
 */
export function validatePromptText(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Prompt cannot be empty' };
  }

  if (text.length > 10000) {
    return { isValid: false, error: 'Prompt is too long (max 10,000 characters)' };
  }

  return { isValid: true };
}

/**
 * Check if a workflow has any editable parameters
 */
export function hasEditableParameters(workflow: Workflow): boolean {
  const analysis = analyzeWorkflowParameters(workflow);
  return analysis.hasSeedNodes || analysis.hasPromptNodes;
}

/**
 * Get a summary of parameter overrides for display
 */
export function getOverridesSummary(overrides: ParameterOverrides): string {
  const parts: string[] = [];

  if (overrides.randomizeSeeds) {
    parts.push('Seeds randomized');
  }

  if (overrides.promptOverrides) {
    const promptCount = Object.keys(overrides.promptOverrides).length;
    if (promptCount > 0) {
      parts.push(`${promptCount} prompt${promptCount > 1 ? 's' : ''} edited`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : 'No customizations';
}
