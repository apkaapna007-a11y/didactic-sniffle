'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useServiceWorker, useInstallPrompt } from '@/hooks/usePWA';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import SettingsModal from '@/components/SettingsModal';
import PersonaModal from '@/components/PersonaModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, Wifi, WifiOff } from 'lucide-react';

export default function Home() {
  const { sidebarOpen } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [editPersonaId, setEditPersonaId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const { hasUpdate, updateServiceWorker } = useServiceWorker();
  const { canInstall, promptInstall } = useInstallPrompt();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (canInstall) {
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  const handleOpenPersonaModal = (editId?: string) => {
    setEditPersonaId(editId || null);
    setPersonaModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-amber-600 text-white px-4 py-2 text-center text-sm font-medium z-[100] flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            You are offline. Some features may be limited.
          </motion.div>
        )}

        {hasUpdate && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: isOnline ? 0 : 40, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-indigo-600 text-white px-4 py-2 text-center text-sm font-medium z-[99] flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            A new version is available!
            <button
              onClick={updateServiceWorker}
              className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Update Now
            </button>
          </motion.div>
        )}

        {showInstallBanner && canInstall && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-2xl z-[100]"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Install AI Studio</h3>
                <p className="text-sm text-white/80 mb-3">
                  Install for quick access and offline use
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={promptInstall}
                    className="px-4 py-2 bg-white text-indigo-600 font-medium rounded-xl hover:bg-white/90 transition-colors"
                  >
                    Install
                  </button>
                  <button
                    onClick={() => setShowInstallBanner(false)}
                    className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOnline && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
      )}

      <div className="flex h-full relative">
        <Sidebar
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPersonaModal={handleOpenPersonaModal}
        />

        <div
          className={`flex-1 h-full relative transition-all duration-300 ${
            sidebarOpen ? 'md:pl-72 pl-0' : 'pl-0'
          }`}
        >
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" />
          <div className="relative h-full">
            <ChatInterface />
          </div>
        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PersonaModal
        isOpen={personaModalOpen}
        onClose={() => {
          setPersonaModalOpen(false);
          setEditPersonaId(null);
        }}
        editId={editPersonaId}
      />
    </main>
  );
}
