'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Copy, Check, Code, FileText, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArtifactRenderer from './ArtifactRenderer';
import { Artifact } from '@/types';

export default function ChatInterface() {
  const {
    settings,
    personas,
    conversations,
    activePersonaId,
    activeConversationId,
    addConversation,
    addMessage,
    addArtifact,
    isApiKeyValid,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePersona = personas.find((p) => p.id === activePersonaId);
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streamingContent, scrollToBottom]);

  const extractArtifacts = (content: string): { cleanContent: string; artifacts: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>[] } => {
    const artifacts: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    let cleanContent = content;

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let index = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      
      if (code.length > 50) {
        const type = language === 'html' ? 'html' : 
                    language === 'mermaid' ? 'mermaid' :
                    language === 'svg' ? 'svg' :
                    language === 'markdown' || language === 'md' ? 'markdown' : 'code';
        
        artifacts.push({
          title: `${language.charAt(0).toUpperCase() + language.slice(1)} Snippet ${index + 1}`,
          type,
          content: code,
          language,
          personaId: activePersonaId || 'default',
          conversationId: activeConversationId || '',
        });
        index++;
      }
    }

    return { cleanContent, artifacts };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    let conversationId = activeConversationId;
    if (!conversationId) {
      const newConv = addConversation(activePersonaId || 'default', userMessage.slice(0, 50));
      conversationId = newConv.id;
    }

    addMessage(conversationId, { role: 'user', content: userMessage });

    try {
      const messages = activeConversation?.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })) || [];

      messages.push({ role: 'user', content: userMessage });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: activePersona?.model || settings.selectedModel,
          systemPrompt: activePersona?.systemPrompt,
          temperature: activePersona?.temperature || 0.7,
          apiKey: settings.openRouterApiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamingContent(fullContent);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      const { artifacts } = extractArtifacts(fullContent);
      
      const createdArtifacts = artifacts.map((a) => addArtifact({ ...a, conversationId }));

      addMessage(conversationId, {
        role: 'assistant',
        content: fullContent,
        artifacts: createdArtifacts,
        personaId: activePersonaId || undefined,
      });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(conversationId, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
      });
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayMessages = activeConversation?.messages || [];

  return (
    <div className="flex flex-col h-full bg-slate-950/95">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {displayMessages.length === 0 && !streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-2xl"
              style={{ backgroundColor: `${activePersona?.color}20` }}
            >
              {activePersona?.avatar || '🤖'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {activePersona?.name || 'AI Assistant'}
            </h2>
            <p className="text-slate-400 max-w-md mb-8">
              {activePersona?.description || 'Start a conversation to get help with coding, writing, analysis, and more.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                { icon: Code, text: 'Generate code snippets' },
                { icon: FileText, text: 'Create documents' },
                { icon: Sparkles, text: 'Brainstorm ideas' },
                { icon: RotateCcw, text: 'Debug and refactor' },
              ].map(({ icon: Icon, text }, i) => (
                <button
                  key={i}
                  onClick={() => setInput(text)}
                  className="flex items-center gap-3 p-4 bg-slate-800/30 hover:bg-slate-700/50 rounded-xl transition-all text-left group"
                >
                  <Icon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300">{text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {displayMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{activePersona?.avatar || '🤖'}</span>
                    <span className="text-sm font-medium text-slate-400">
                      {activePersona?.name || 'Assistant'}
                    </span>
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                
                {message.artifacts && message.artifacts.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.artifacts.map((artifact) => (
                      <ArtifactRenderer key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50">
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedId === message.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {streamingContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] rounded-2xl p-4 bg-slate-800/50 text-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{activePersona?.avatar || '🤖'}</span>
                <span className="text-sm font-medium text-slate-400">
                  {activePersona?.name || 'Assistant'}
                </span>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingContent}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800/50">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isApiKeyValid
                ? `Message ${activePersona?.name || 'AI Assistant'}...`
                : 'Please add your API key in settings to start chatting...'
            }
            disabled={!isApiKeyValid || isLoading}
            rows={1}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '56px', maxHeight: '200px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !isApiKeyValid}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 rounded-xl transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </form>
        <p className="text-xs text-slate-600 text-center mt-2">
          {activePersona?.model || settings.selectedModel} • Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
