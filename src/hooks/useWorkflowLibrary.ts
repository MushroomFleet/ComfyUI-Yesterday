// src/hooks/useWorkflowLibrary.ts

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { workflowStorage } from '../services/storage.service';
import {
  WorkflowLibraryItem,
  CreateWorkflowInput,
  UpdateWorkflowInput,
} from '../types/workflow-library.types';

/**
 * Hook for accessing and managing workflow library
 */
export function useWorkflowLibrary() {
  // Live query - automatically updates when database changes
  const workflows = useLiveQuery(
    () => workflowStorage.getAllWorkflows(),
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Create a new workflow
   */
  const createWorkflow = useCallback(async (input: CreateWorkflowInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const workflow = await workflowStorage.createWorkflow(input);
      return workflow;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update a workflow
   */
  const updateWorkflow = useCallback(async (id: string, updates: UpdateWorkflowInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const workflow = await workflowStorage.updateWorkflow(id, updates);
      return workflow;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a workflow
   */
  const deleteWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await workflowStorage.deleteWorkflow(id);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    workflows: workflows || [],
    isLoading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
  };
}

/**
 * Hook for filtered workflows
 */
export function useFilteredWorkflows(tags?: string[], searchQuery?: string) {
  const [workflows, setWorkflows] = useState<WorkflowLibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadWorkflows = async () => {
      setIsLoading(true);
      try {
        let result: WorkflowLibraryItem[];

        if (searchQuery) {
          result = await workflowStorage.searchWorkflows(searchQuery);
        } else if (tags && tags.length > 0) {
          result = await workflowStorage.getWorkflowsByTags(tags);
        } else {
          result = await workflowStorage.getAllWorkflows();
        }

        setWorkflows(result);
      } catch (err) {
        console.error('Error loading workflows:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflows();
  }, [tags, searchQuery]);

  return { workflows, isLoading };
}

/**
 * Hook for all available tags
 */
export function useWorkflowTags() {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    workflowStorage.getAllTags().then(setTags);
  }, []);

  return tags;
}
