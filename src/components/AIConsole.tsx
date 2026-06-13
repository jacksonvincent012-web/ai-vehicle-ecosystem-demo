import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const typeColors: Record<string, string> = {
  decision: '#00f0ff',
  prediction: '#7b61ff',
  learning: '#00ff88',
  optimization: '#ffaa00',
  negotiation: '#4ecdc4',
  warning: '#ff8800',
  info: '#8888ff',
  voice: '#ff69b4',
};

const typeIcons: Record<string, string> = {
  decision: '🧠',
  prediction: '🔮',
  learning: '📚',
  optimization: '⚙️',
  negotiation: '🤝',
  warning: '⚠️',
  info: 'ℹ️',
  voice: '🎤',
};

const AIConsole: React.FC = () => {
  const { aiLogs, showAIConsole, toggleAIConsole } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [aiLogs.length]);

  if (!showAIConsole) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] z-40 glass-card border border-white/10 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🤖</span>
          <span className="text-xs font-bold text-cyan-400" style={{ fontFamily: 'Orbitron' }}>AI REASONING CONSOLE</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-500 font-mono">{aiLogs.length} entries</span>
          <button onClick={toggleAIConsole} className="text-gray-500 hover:text-white text-sm">✕</button>
        </div>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="p-2 max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {aiLogs.slice(0, 50).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i < 3 ? i * 0.05 : 0 }}
              className="p-1.5 rounded border border-white/[0.03] hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start gap-1.5">
                <span className="text-xs mt-0.5">{typeIcons[log.type] || 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] font-semibold" style={{ color: typeColors[log.type] || '#888' }}>
                      [{log.module}] {log.action}
                    </span>
                    <span className="text-[8px] text-gray-600 font-mono">{formatTime(log.timestamp)}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 leading-relaxed break-words">{log.message}</div>
                  {log.confidence !== undefined && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <div className="h-0.5 flex-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${log.confidence * 100}%`, backgroundColor: typeColors[log.type] || '#888' }} />
                      </div>
                      <span className="text-[8px] text-gray-600">{(log.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {aiLogs.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-6">
            AI reasoning will appear here when simulation runs...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIConsole;
