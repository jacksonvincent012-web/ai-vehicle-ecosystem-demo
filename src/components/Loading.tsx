import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  progress: number;
}

const Loading: React.FC<LoadingProps> = ({ progress }) => (
  <div className="fixed inset-0 bg-[#0a0a1a] flex items-center justify-center z-50 overflow-hidden">
    {/* Particle background */}
    <div className="absolute inset-0">
      {[...Array(60)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            background: ['#00f0ff', '#7b61ff', '#00ff88', '#ff3355'][i % 4],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -200 - Math.random() * 300], opacity: [0, 1, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}
    </div>

    <div className="text-center relative z-10">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div className="text-7xl mb-6">🚗</div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold mb-2"
        style={{ fontFamily: 'Orbitron' }}
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
          AI Vehicle Ecosystem
        </span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 mb-8 text-lg"
      >
        Predictive Negotiation & Fuel Management
      </motion.p>

      <div className="w-80 mx-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Initializing AI Systems</span>
          <span className="text-cyan-400">{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 text-xs text-gray-600 space-y-1">
          {progress > 15 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Neural networks loaded</motion.div>}
          {progress > 35 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Fleet data synchronized</motion.div>}
          {progress > 55 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Traffic prediction models ready</motion.div>}
          {progress > 75 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ Negotiation engine initialized</motion.div>}
          {progress > 90 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>✅ WebSocket connection established</motion.div>}
          {progress > 98 && <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-cyan-400">✅ System online</motion.div>}
        </div>
      </div>
    </div>
  </div>
);

export default Loading;
