
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

export type FileType = 'javascript' | 'image' | 'video' | 'css' | 'folder';

export interface AppFile {
  id: string;
  parentId: string | null; // null means root
  name: string;
  content: string; // Code string for JS, ObjectURL for media, or empty for folder
  type: FileType;
  blob?: Blob; // Raw blob for assets
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  timestamp: number;
}

