export interface AIPersona {
  id: string;
  name: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  model: string;
  color: string;
  voice?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Artifact {
  id: string;
  title: string;
  type: 'code' | 'document' | 'image' | 'html' | 'markdown' | 'mermaid' | 'svg';
  content: string;
  language?: string;
  personaId: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  artifacts?: Artifact[];
  createdAt: Date;
  personaId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  personaId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

export interface AppSettings {
  openRouterApiKey: string;
  selectedModel: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  showArtifactPreview: boolean;
}

export const FREE_MODELS = [
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B Instruct (Free)', provider: 'Meta' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free', name: 'Llama 3.1 8B Instruct (Free)', provider: 'Meta' },
  { id: 'google/gemma-2-9b-it:free', name: 'Gemma 2 9B IT (Free)', provider: 'Google' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B Instruct (Free)', provider: 'Mistral' },
  { id: 'huggingfaceh4/zephyr-7b-beta:free', name: 'Zephyr 7B Beta (Free)', provider: 'HuggingFace' },
  { id: 'openchat/openchat-7b:free', name: 'OpenChat 7B (Free)', provider: 'OpenChat' },
  { id: 'qwen/qwen-2-7b-instruct:free', name: 'Qwen 2 7B Instruct (Free)', provider: 'Alibaba' },
  { id: 'microsoft/phi-3-mini-128k-instruct:free', name: 'Phi-3 Mini 128K (Free)', provider: 'Microsoft' },
  { id: 'nousresearch/nous-capybara-7b:free', name: 'Nous Capybara 7B (Free)', provider: 'Nous Research' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', provider: 'DeepSeek' },
];
