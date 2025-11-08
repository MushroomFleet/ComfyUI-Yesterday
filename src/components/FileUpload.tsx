import React, { useRef, ChangeEvent } from 'react';
import { Workflow } from '../types/comfyui.types';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

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
      
      if (typeof workflow !== 'object' || workflow === null) {
        throw new Error('Invalid workflow format');
      }

      onWorkflowLoaded(workflow, file.name);
    } catch (error) {
      alert(`Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error loading workflow:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        onClick={handleClick}
        disabled={disabled}
        size="lg"
        className="gap-2"
      >
        <Upload className="h-5 w-5" />
        Upload Workflow JSON
      </Button>
    </div>
  );
};
