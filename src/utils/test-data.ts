// src/utils/test-data.ts

import { workflowStorage, taskStorage } from '../services/storage.service';
import { TaskPriority } from '../types/scheduled-task.types';

/**
 * Generate sample workflows for testing
 */
export async function generateSampleWorkflows() {
  const sampleWorkflows = [
    {
      name: 'SDXL Text to Image',
      fileName: 'sdxl-t2i.json',
      workflow: {
        '1': { class_type: 'LoadCheckpoint', inputs: { ckpt_name: 'sdxl.safetensors' } },
        '2': { class_type: 'CLIPTextEncode', inputs: { text: 'beautiful landscape' } },
        '3': { class_type: 'KSampler', inputs: {} },
        '4': { class_type: 'SaveImage', inputs: {} },
      },
      tags: ['t2i', 'image', 'SDXL'],
      description: 'Basic SDXL text to image workflow',
    },
    {
      name: 'AnimateDiff Video',
      fileName: 'animatediff-video.json',
      workflow: {
        '1': { class_type: 'LoadCheckpoint', inputs: {} },
        '2': { class_type: 'AnimateDiffLoader', inputs: {} },
        '3': { class_type: 'KSampler', inputs: {} },
        '4': { class_type: 'SaveAnimatedWebP', inputs: {} },
      },
      tags: ['video', 'animation', 'AnimateDiff'],
      description: 'AnimateDiff video generation',
    },
    {
      name: 'Image to Image Upscale',
      fileName: 'i2i-upscale.json',
      workflow: {
        '1': { class_type: 'LoadImage', inputs: {} },
        '2': { class_type: 'UpscaleModel', inputs: {} },
        '3': { class_type: 'SaveImage', inputs: {} },
      },
      tags: ['i2i', 'upscale', 'image'],
      description: 'Image upscaling workflow',
    },
  ];

  for (const workflow of sampleWorkflows) {
    await workflowStorage.createWorkflow(workflow);
  }

  console.log(`✓ Generated ${sampleWorkflows.length} sample workflows`);
}

/**
 * Generate sample tasks for testing
 */
export async function generateSampleTasks() {
  const workflows = await workflowStorage.getAllWorkflows();
  
  if (workflows.length === 0) {
    console.error('No workflows found. Generate sample workflows first.');
    return;
  }

  const now = new Date();
  const tasks = [
    {
      workflowId: workflows[0].id,
      scheduledTime: new Date(now.getTime() + 3600000), // 1 hour from now
      priority: TaskPriority.HIGH,
    },
    {
      workflowId: workflows[1]?.id || workflows[0].id,
      scheduledTime: new Date(now.getTime() + 7200000), // 2 hours from now
      priority: TaskPriority.NORMAL,
    },
    {
      workflowId: workflows[2]?.id || workflows[0].id,
      scheduledTime: new Date(now.getTime() + 86400000), // 1 day from now
      priority: TaskPriority.LOW,
    },
  ];

  for (const task of tasks) {
    await taskStorage.createTask(task);
  }

  console.log(`✓ Generated ${tasks.length} sample tasks`);
}

/**
 * Run all test data generation
 */
export async function generateAllTestData() {
  console.log('Generating test data...');
  await generateSampleWorkflows();
  await generateSampleTasks();
  console.log('✓ Test data generation complete');
}

/**
 * Clear all data from database
 */
export async function clearAllData() {
  const { db } = await import('../services/database');
  await db.clearAll();
  console.log('✓ All data cleared');
}

/**
 * Test basic CRUD operations
 */
export async function testCrudOperations() {
  console.log('Testing CRUD operations...');
  
  try {
    // Test workflow creation
    const workflow = await workflowStorage.createWorkflow({
      name: 'Test Workflow',
      fileName: 'test.json',
      workflow: { '1': { class_type: 'LoadImage', inputs: {} } },
      tags: ['test'],
      description: 'Test workflow',
    });
    console.log('✓ Created workflow:', workflow.id);

    // Test workflow retrieval
    const retrieved = await workflowStorage.getWorkflow(workflow.id);
    console.log('✓ Retrieved workflow:', retrieved?.name);

    // Test workflow update
    await workflowStorage.updateWorkflow(workflow.id, { name: 'Updated Test Workflow' });
    console.log('✓ Updated workflow');

    // Test task creation
    const task = await taskStorage.createTask({
      workflowId: workflow.id,
      scheduledTime: new Date(Date.now() + 3600000),
    });
    console.log('✓ Created task:', task.id);

    // Test task retrieval
    const retrievedTask = await taskStorage.getTask(task.id);
    console.log('✓ Retrieved task:', retrievedTask?.workflowName);

    // Test statistics
    const stats = await taskStorage.getStatistics();
    console.log('✓ Task statistics:', stats);

    // Clean up test data
    await taskStorage.deleteTask(task.id);
    await workflowStorage.deleteWorkflow(workflow.id);
    console.log('✓ Cleaned up test data');

    console.log('All CRUD tests passed!');
  } catch (error) {
    console.error('CRUD test failed:', error);
    throw error;
  }
}
