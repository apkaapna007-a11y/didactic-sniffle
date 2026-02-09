'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Settings,
  Plus,
  MessageSquare,
  Users,
  Trash2,
  Edit3,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenPersonaModal: (editId?: string) => void;
}

export default function Sidebar({ onOpenSettings, onOpenPersonaModal }: SidebarProps) {
  const {
    sidebarOpen,
    toggleSidebar,
    personas,
    conversations,
    activePersonaId,
    activeConversationId,
    setActivePersona,
    setActiveConversation,
    addConversation,
    deleteConversation,
    deletePersona,
  } = useAppStore();

  const [showPersonas, setShowPersonas] = useState(true);
  const [showConversations, setShowConversations] = useState(true);

  const activePersona = personas.find((p) => p.id === activePersonaId);
  const personaConversations = conversations.filter((c) => c.personaId === activePersonaId);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-sm rounded-xl hover:bg-slate-700/80 transition-colors md:hidden"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleSidebar}
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 z-50 flex flex-col"
            >
              <div className="p-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-white text-lg">AI Studio</h1>
                    <p className="text-xs text-slate-500">Persona & Artifacts</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-3">
                  <button
                    onClick={() => setShowPersonas(!showPersonas)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Personas
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showPersonas ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showPersonas && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 mt-1">
                          {personas.map((persona) => (
                            <motion.div
                              key={persona.id}
                              whileHover={{ scale: 1.02 }}
                              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                activePersonaId === persona.id
                                  ? 'bg-indigo-600/20 border border-indigo-500/30'
                                  : 'hover:bg-slate-800/50'
                              }`}
                              onClick={() => setActivePersona(persona.id)}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                style={{ backgroundColor: `${persona.color}30` }}
                              >
                                {persona.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {persona.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {persona.description}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenPersonaModal(persona.id);
                                  }}
                                  className="p-1 hover:bg-slate-700/50 rounded"
                                >
                                  <Edit3 className="w-3 h-3 text-slate-400" />
                                </button>
                                {persona.id !== 'default' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deletePersona(persona.id);
                                    }}
                                    className="p-1 hover:bg-red-500/20 rounded"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}

                          <button
                            onClick={() => onOpenPersonaModal()}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Create Persona
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-3 border-t border-slate-800/50">
                  <button
                    onClick={() => setShowConversations(!showConversations)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Conversations
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showConversations ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showConversations && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 mt-1">
                          <button
                            onClick={() => addConversation(activePersonaId || 'default')}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            New Chat with {activePersona?.name || 'AI'}
                          </button>

                          {personaConversations.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-slate-600">
                              No conversations yet
                            </p>
                          ) : (
                            personaConversations.map((conv) => (
                              <motion.div
                                key={conv.id}
                                whileHover={{ scale: 1.02 }}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                  activeConversationId === conv.id
                                    ? 'bg-slate-700/50'
                                    : 'hover:bg-slate-800/50'
                                }`}
                                onClick={() => setActiveConversation(conv.id)}
                              >
                                <MessageSquare className="w-4 h-4 text-slate-500" />
                                <span className="flex-1 text-sm text-slate-300 truncate">
                                  {conv.title}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConversation(conv.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-3 border-t border-slate-800/50 space-y-2">
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
                >
                  <Layers className="w-4 h-4" />
                  View All Artifacts
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
