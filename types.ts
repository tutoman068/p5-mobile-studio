export interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export enum Tab {
  EDITOR = 'EDITOR',
  PREVIEW = 'PREVIEW'
}

export interface SketchData {
  code: string;
  name: string;
}