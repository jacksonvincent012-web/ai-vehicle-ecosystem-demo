import React from 'react';
import { motion } from 'framer-motion';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'Space', action: 'Start / Pause simulation', category: 'Simulation' },
  { key: 'S', action: 'Step forward one frame', category: 'Simulation' },
  { key: 'R', action: 'Reset simulation', category: 'Simulation' },
  { key: '1-5', action: 'Run scenario 1-5', category: 'Scenarios' },
  { key: 'Escape', action: 'Deselect vehicle / Close modal', category: 'Navigation' },
  { key: 'H', action: 'Toggle "How It Works" modal', category: 'UI' },
  { key: 'C', action: 'Toggle comparison panel', category: 'UI' },
  { key: 'A', action: 'Toggle AI console', category: 'UI' },
  { key: 'M', action: 'Toggle 2D/3D map', category: 'UI' },
  { key: 'E', action: 'Trigger emergency scenario', category: 'Actions' },
  { key: '?', action: 'Show keyboard shortcuts', category: 'Help' },
];

const categories = [...new Set(shortcuts.map(s => s.category))];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 30, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="glass-card p-6 w-full max-w-lg border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" style={{ fontFamily: 'Orbitron' }}>
            ⌨️ Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-[10px] text-gray-500 uppercase font-semibold mb-1.5">{cat}</h3>
              <div className="space-y-1">
                {shortcuts.filter(s => s.category === cat).map(s => (
                  <div key={s.key} className="flex items-center justify-between py-1 px-2 rounded hover:bg-white/[0.03]">
                    <span className="text-xs text-gray-300">{s.action}</span>
                    <kbd className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-cyan-400 font-mono border border-white/10">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 text-center">
          <span className="text-[10px] text-gray-600">Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-gray-400 font-mono">?</kbd> to toggle this panel</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default KeyboardShortcuts;
