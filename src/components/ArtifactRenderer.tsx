'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Maximize2, X, Play, Code, FileText, Image as ImageIcon } from 'lucide-react';
import { Artifact } from '@/types';
import { Highlight, themes } from 'prism-react-renderer';

interface ArtifactRendererProps {
  artifact: Artifact;
}

export default function ArtifactRenderer({ artifact }: ArtifactRendererProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(artifact.type === 'html' || artifact.type === 'svg');

  const copyContent = async () => {
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadArtifact = () => {
    const extensions: Record<string, string> = {
      code: artifact.language || 'txt',
      html: 'html',
      markdown: 'md',
      mermaid: 'mmd',
      svg: 'svg',
      document: 'txt',
      image: 'png',
    };
    
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/\s+/g, '_')}.${extensions[artifact.type] || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getIcon = () => {
    switch (artifact.type) {
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'html':
      case 'svg':
        return <Play className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const renderPreview = () => {
    if (artifact.type === 'html') {
      return (
        <iframe
          srcDoc={artifact.content}
          className="w-full h-64 bg-white rounded-lg"
          sandbox="allow-scripts"
          title={artifact.title}
        />
      );
    }
    if (artifact.type === 'svg') {
      return (
        <div 
          className="w-full p-4 bg-white rounded-lg flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: artifact.content }}
        />
      );
    }
    return null;
  };

  const renderCode = () => (
    <Highlight theme={themes.nightOwl} code={artifact.content} language={artifact.language || 'plaintext'}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          style={{ ...style, margin: 0, padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}
          className="text-sm max-h-96"
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="text-slate-500 mr-4 select-none text-xs">{i + 1}</span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  return (
    <>
      <motion.div
        layout
        className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">{getIcon()}</span>
            <span className="text-sm font-medium text-slate-300">{artifact.title}</span>
            {artifact.language && (
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                {artifact.language}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {(artifact.type === 'html' || artifact.type === 'svg') && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showPreview ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700/50 text-slate-400'
                }`}
                title={showPreview ? 'Show Code' : 'Show Preview'}
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={copyContent}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={downloadArtifact}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(true)}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400"
              title="Expand"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          {showPreview && (artifact.type === 'html' || artifact.type === 'svg') ? (
            renderPreview()
          ) : (
            renderCode()
          )}
        </div>
      </motion.div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-indigo-400">{getIcon()}</span>
                <span className="text-lg font-medium text-white">{artifact.title}</span>
                {artifact.language && (
                  <span className="text-sm px-3 py-1 rounded-full bg-slate-700/50 text-slate-300">
                    {artifact.language}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(artifact.type === 'html' || artifact.type === 'svg') && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
                      showPreview ? 'bg-indigo-600 text-white' : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {showPreview ? 'Show Code' : 'Preview'}
                  </button>
                )}
                <button
                  onClick={copyContent}
                  className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-slate-300 text-sm flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={downloadArtifact}
                  className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-slate-300 text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              {showPreview && (artifact.type === 'html' || artifact.type === 'svg') ? (
                <div className="p-6">
                  {artifact.type === 'html' ? (
                    <iframe
                      srcDoc={artifact.content}
                      className="w-full h-[70vh] bg-white rounded-lg"
                      sandbox="allow-scripts"
                      title={artifact.title}
                    />
                  ) : (
                    <div 
                      className="w-full p-8 bg-white rounded-lg flex items-center justify-center min-h-[400px]"
                      dangerouslySetInnerHTML={{ __html: artifact.content }}
                    />
                  )}
                </div>
              ) : (
                <div className="p-4">
                  {renderCode()}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
