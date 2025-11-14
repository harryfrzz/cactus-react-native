export interface CactusDownloadParams {
  model?: string;
  onProgress?: (progress: number) => void;
}

export interface CactusInitParams {
  model?: string;
  contextSize?: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Options {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface CactusCompletionParams {
  messages: Message[];
  options?: Options;
  onToken?: (token: string) => void;
  model?: string;
  contextSize?: number;
}

export interface CactusCompletionResult {
  success: boolean;
  response: string;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  tokensPerSecond: number;
  totalTokens: number;
}

export interface CactusEmbeddingParams {
  text: string;
  model?: string;
}

export interface CactusEmbeddingResult {
  embedding: number[];
}

export interface CactusModel {
  name: string;
  slug: string;
  quantization: number;
  size_mb: number;
  download_url: string;
  supports_tool_calling: boolean;
  supports_vision: boolean;
  created_at: Date;
}
