
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

export type FileType = 'javascript' | 'image' | 'video' | 'css';

export interface AppFile {
  id: string;
  name: string;
  content: string; // Code string for JS, or ObjectURL for media
  type: FileType;
  blob?: Blob; // Raw blob for assets
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  timestamp: number;
}
