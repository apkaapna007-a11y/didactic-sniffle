'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Palette, Brain, Sliders } from 'lucide-react';
import { useAppStore } from '@/store';
import { FREE_MODELS } from '@/types';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

const avatarOptions = ['🤖', '🧠', '💡', '🌟', '🎨', '🔮', '⚡', '🦾', '👾', '🎯', '🚀', '💎', '🌈', '🎭', '🦊', '🐉'];
const colorOptions = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];

export default function PersonaModal({ isOpen, onClose, editId }: PersonaModalProps) {
  const { personas, addPersona, updatePersona, settings } = useAppStore();
  const existingPersona = editId ? personas.find(p => p.id === editId) : null;
  
  const [formData, setFormData] = useState({
    name: existingPersona?.name || '',
    avatar: existingPersona?.avatar || '🤖',
    description: existingPersona?.description || '',
    systemPrompt: existingPersona?.systemPrompt || 'You are a helpful AI assistant. Be concise, accurate, and friendly.',
    temperature: existingPersona?.temperature || 0.7,
    model: existingPersona?.model || settings.selectedModel,
    color: existingPersona?.color || '#6366f1',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editId) {
      updatePersona(editId, formData);
    } else {
      addPersona(formData);
    }
    onClose();
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
          className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-700/50 max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              {editId ? 'Edit Persona' : 'Create New Persona'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setFormData({ ...formData, avatar: emoji })}
                      className={`w-10 h-10 text-xl rounded-lg transition-all ${
                        formData.avatar === emoji
                          ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-500/30'
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Persona Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Code Mentor, Creative Writer..."
                className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Short Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of what this persona does..."
                className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                System Prompt
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Define the personality, capabilities, and behavior of your AI persona..."
                rows={5}
                className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Model</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  {FREE_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Temperature: {formData.temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 mt-3"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Accent Color</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 rounded-xl transition-all disabled:cursor-not-allowed"
              >
                {editId ? 'Save Changes' : 'Create Persona'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
