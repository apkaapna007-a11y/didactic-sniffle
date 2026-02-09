'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, X, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';
import { FREE_MODELS } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, setSettings, setApiKey, isApiKeyValid, setApiKeyValid, isValidating, setValidating } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState(settings.openRouterApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    setApiKeyInput(settings.openRouterApiKey);
  }, [settings.openRouterApiKey]);

  const validateApiKey = async () => {
    if (!apiKeyInput.trim()) {
      setValidationMessage('Please enter an API key');
      setApiKeyValid(false);
      return;
    }

    setValidating(true);
    setValidationMessage('');

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput }),
      });

      const data = await response.json();

      if (data.valid) {
        setApiKey(apiKeyInput);
        setApiKeyValid(true);
        setValidationMessage('API key validated successfully!');
      } else {
        setApiKeyValid(false);
        setValidationMessage(data.error || 'Invalid API key');
      }
    } catch {
      setApiKeyValid(false);
      setValidationMessage('Failed to validate API key');
    } finally {
      setValidating(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSettings({ selectedModel: modelId });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[9999] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Key className="w-4 h-4" />
                OpenRouter API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setApiKeyValid(null);
                    setValidationMessage('');
                  }}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-24 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isApiKeyValid !== null && (
                    <span className={`p-1 rounded-full ${isApiKeyValid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {isApiKeyValid ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={validateApiKey}
                disabled={isValidating || !apiKeyInput.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Validate & Save API Key
                  </>
                )}
              </button>

              {validationMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm ${isApiKeyValid ? 'text-green-400' : 'text-red-400'}`}
                >
                  {validationMessage}
                </motion.p>
              )}

              <p className="text-xs text-slate-500">
                Get your free API key at{' '}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline"
                >
                  openrouter.ai/keys
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                Select Free Model
              </label>
              <div className="grid gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {FREE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 ${
                      settings.selectedModel === model.id
                        ? 'bg-indigo-600/30 border-2 border-indigo-500/50'
                        : 'bg-slate-800/30 border-2 border-transparent hover:bg-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white text-sm">{model.name}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Free
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{model.provider}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Theme</label>
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setSettings({ theme })}
                    className={`flex-1 py-2 px-4 rounded-xl capitalize transition-all ${
                      settings.theme === theme
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
