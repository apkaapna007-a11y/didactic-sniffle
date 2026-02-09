import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIPersona, Artifact, Conversation, Message, AppSettings, FREE_MODELS } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  settings: AppSettings;
  personas: AIPersona[];
  artifacts: Artifact[];
  conversations: Conversation[];
  activePersonaId: string | null;
  activeConversationId: string | null;
  isApiKeyValid: boolean | null;
  isValidating: boolean;
  sidebarOpen: boolean;
  artifactPanelOpen: boolean;

  setSettings: (settings: Partial<AppSettings>) => void;
  setApiKey: (key: string) => void;
  setApiKeyValid: (valid: boolean | null) => void;
  setValidating: (validating: boolean) => void;
  
  addPersona: (persona: Omit<AIPersona, 'id' | 'createdAt' | 'updatedAt'>) => AIPersona;
  updatePersona: (id: string, updates: Partial<AIPersona>) => void;
  deletePersona: (id: string) => void;
  setActivePersona: (id: string | null) => void;
  
  addArtifact: (artifact: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>) => Artifact;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  deleteArtifact: (id: string) => void;
  
  addConversation: (personaId: string, title?: string) => Conversation;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) => Message;
  
  toggleSidebar: () => void;
  toggleArtifactPanel: () => void;
}

const defaultPersona: AIPersona = {
  id: 'default',
  name: 'Nova',
  avatar: '🤖',
  description: 'A helpful AI assistant ready to help with any task',
  systemPrompt: 'You are Nova, a helpful, creative, and knowledgeable AI assistant. You can help with coding, writing, analysis, and creative tasks. When creating content that could be an artifact (code, documents, diagrams), wrap them appropriately.',
  temperature: 0.7,
  model: FREE_MODELS[0].id,
  color: '#6366f1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: {
        openRouterApiKey: '',
        selectedModel: FREE_MODELS[0].id,
        theme: 'dark',
        fontSize: 14,
        showArtifactPreview: true,
      },
      personas: [defaultPersona],
      artifacts: [],
      conversations: [],
      activePersonaId: 'default',
      activeConversationId: null,
      isApiKeyValid: null,
      isValidating: false,
      sidebarOpen: true,
      artifactPanelOpen: false,

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setApiKey: (key) =>
        set((state) => ({
          settings: { ...state.settings, openRouterApiKey: key },
          isApiKeyValid: null,
        })),

      setApiKeyValid: (valid) => set({ isApiKeyValid: valid }),
      setValidating: (validating) => set({ isValidating: validating }),

      addPersona: (personaData) => {
        const persona: AIPersona = {
          ...personaData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          personas: [...state.personas, persona],
        }));
        return persona;
      },

      updatePersona: (id, updates) =>
        set((state) => ({
          personas: state.personas.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),

      deletePersona: (id) =>
        set((state) => ({
          personas: state.personas.filter((p) => p.id !== id),
          activePersonaId: state.activePersonaId === id ? 'default' : state.activePersonaId,
        })),

      setActivePersona: (id) => set({ activePersonaId: id }),

      addArtifact: (artifactData) => {
        const artifact: Artifact = {
          ...artifactData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          artifacts: [...state.artifacts, artifact],
          artifactPanelOpen: true,
        }));
        return artifact;
      },

      updateArtifact: (id, updates) =>
        set((state) => ({
          artifacts: state.artifacts.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          ),
        })),

      deleteArtifact: (id) =>
        set((state) => ({
          artifacts: state.artifacts.filter((a) => a.id !== id),
        })),

      addConversation: (personaId, title) => {
        const conversation: Conversation = {
          id: uuidv4(),
          title: title || 'New Conversation',
          personaId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [...state.conversations, conversation],
          activeConversationId: conversation.id,
        }));
        return conversation;
      },

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        })),

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        })),

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (conversationId, messageData) => {
        const message: Message = {
          ...messageData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
              : c
          ),
        }));
        return message;
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleArtifactPanel: () => set((state) => ({ artifactPanelOpen: !state.artifactPanelOpen })),
    }),
    {
      name: 'ai-persona-studio',
      partialize: (state) => ({
        settings: state.settings,
        personas: state.personas,
        artifacts: state.artifacts,
        conversations: state.conversations,
        activePersonaId: state.activePersonaId,
      }),
    }
  )
);
