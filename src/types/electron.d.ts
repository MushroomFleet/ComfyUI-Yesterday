// Type declarations for Electron API exposed via preload script

export interface ElectronAPI {
  sendSchedulerStatus: (status: {
    running: boolean;
    pendingTasks: number;
    queueSize: number;
  }) => void;
  showNotification: (title: string, body: string) => void;
  appReady: () => void;
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;
  isElectron: boolean;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
