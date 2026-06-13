// ============================================
// VOICE COMMANDS INTEGRATION v4.0
// Web Speech API Voice Control System
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

// Extend window for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// ============================================
// TYPES
// ============================================

interface VoiceCommand {
  patterns: string[];
  action: string;
  description: string;
  category: 'simulation' | 'navigation' | 'vehicle' | 'system';
}

interface CommandResult {
  command: string;
  action: string;
  success: boolean;
  timestamp: number;
  confidence: number;
}

// ============================================
// COMMAND DEFINITIONS
// ============================================

const VOICE_COMMANDS: VoiceCommand[] = [
  // Simulation controls
  { patterns: ['start', 'begin', 'go', 'play', 'start simulation', 'begin simulation', 'run'], action: 'START_SIMULATION', description: 'Start the simulation', category: 'simulation' },
  { patterns: ['stop', 'pause', 'halt', 'stop simulation', 'pause simulation'], action: 'STOP_SIMULATION', description: 'Stop the simulation', category: 'simulation' },
  { patterns: ['reset', 'restart', 'reset simulation', 'start over', 'clear'], action: 'RESET_SIMULATION', description: 'Reset the simulation', category: 'simulation' },
  { patterns: ['step', 'next', 'advance', 'step forward', 'next step', 'single step'], action: 'STEP_SIMULATION', description: 'Advance one step', category: 'simulation' },
  
  // Speed controls
  { patterns: ['faster', 'speed up', 'increase speed', 'go faster', 'accelerate'], action: 'SPEED_UP', description: 'Increase simulation speed', category: 'simulation' },
  { patterns: ['slower', 'slow down', 'decrease speed', 'go slower', 'decelerate'], action: 'SLOW_DOWN', description: 'Decrease simulation speed', category: 'simulation' },
  { patterns: ['normal speed', 'one x', '1x speed', 'regular speed'], action: 'SPEED_1X', description: 'Set 1x speed', category: 'simulation' },
  { patterns: ['double speed', 'two x', '2x speed', 'twice as fast'], action: 'SPEED_2X', description: 'Set 2x speed', category: 'simulation' },
  { patterns: ['five x', '5x speed', 'five times'], action: 'SPEED_5X', description: 'Set 5x speed', category: 'simulation' },
  { patterns: ['ten x', '10x speed', 'maximum speed', 'fastest'], action: 'SPEED_10X', description: 'Set 10x speed', category: 'simulation' },
  
  // Scenarios
  { patterns: ['scenario one', 'scenario 1', 'first scenario', 'fuel saving'], action: 'SCENARIO_1', description: 'Run fuel-saving scenario', category: 'simulation' },
  { patterns: ['scenario two', 'scenario 2', 'second scenario', 'urgent delivery'], action: 'SCENARIO_2', description: 'Run urgent delivery scenario', category: 'simulation' },
  { patterns: ['scenario three', 'scenario 3', 'third scenario', 'intersection'], action: 'SCENARIO_3', description: 'Run intersection scenario', category: 'simulation' },
  { patterns: ['scenario four', 'scenario 4', 'fourth scenario', 'weather'], action: 'SCENARIO_4', description: 'Run weather scenario', category: 'simulation' },
  { patterns: ['scenario five', 'scenario 5', 'fifth scenario', 'emergency'], action: 'SCENARIO_5', description: 'Run emergency scenario', category: 'simulation' },
  { patterns: ['emergency', 'dispatch emergency', 'ambulance', 'emergency response'], action: 'TRIGGER_EMERGENCY', description: 'Trigger emergency response', category: 'simulation' },
  
  // Vehicle selection
  { patterns: ['select alpha', 'alpha car', 'vehicle one', 'vehicle 1'], action: 'SELECT_VEHICLE_1', description: 'Select Alpha Car', category: 'vehicle' },
  { patterns: ['select beta', 'beta truck', 'vehicle two', 'vehicle 2'], action: 'SELECT_VEHICLE_2', description: 'Select Beta Truck', category: 'vehicle' },
  { patterns: ['select emergency', 'ambulance', 'vehicle three', 'vehicle 3'], action: 'SELECT_VEHICLE_3', description: 'Select Emergency-01', category: 'vehicle' },
  { patterns: ['select bus', 'city bus', 'vehicle four', 'vehicle 4'], action: 'SELECT_VEHICLE_4', description: 'Select City Bus', category: 'vehicle' },
  { patterns: ['select delta', 'delta sedan', 'vehicle five', 'vehicle 5'], action: 'SELECT_VEHICLE_5', description: 'Select Delta Sedan', category: 'vehicle' },
  { patterns: ['select echo', 'echo van', 'vehicle six', 'vehicle 6'], action: 'SELECT_VEHICLE_6', description: 'Select Echo Van', category: 'vehicle' },
  { patterns: ['select foxtrot', 'foxtrot suv', 'vehicle seven', 'vehicle 7'], action: 'SELECT_VEHICLE_7', description: 'Select Foxtrot SUV', category: 'vehicle' },
  { patterns: ['select golf', 'golf compact', 'vehicle eight', 'vehicle 8'], action: 'SELECT_VEHICLE_8', description: 'Select Golf Compact', category: 'vehicle' },
  { patterns: ['deselect', 'clear selection', 'unselect', 'no vehicle'], action: 'DESELECT_VEHICLE', description: 'Clear vehicle selection', category: 'vehicle' },
  
  // Navigation & View
  { patterns: ['zoom in', 'closer', 'magnify'], action: 'ZOOM_IN', description: 'Zoom in on map', category: 'navigation' },
  { patterns: ['zoom out', 'farther', 'zoom away'], action: 'ZOOM_OUT', description: 'Zoom out on map', category: 'navigation' },
  { patterns: ['toggle 3d', 'switch to 3d', '3d mode', 'three d'], action: 'TOGGLE_3D', description: 'Toggle 3D view', category: 'navigation' },
  { patterns: ['toggle 2d', 'switch to 2d', '2d mode', 'two d'], action: 'TOGGLE_2D', description: 'Toggle 2D view', category: 'navigation' },
  { patterns: ['show heat map', 'heat map on', 'enable heat map'], action: 'SHOW_HEATMAP', description: 'Show traffic heat map', category: 'navigation' },
  { patterns: ['hide heat map', 'heat map off', 'disable heat map'], action: 'HIDE_HEATMAP', description: 'Hide traffic heat map', category: 'navigation' },
  
  // System
  { patterns: ['show stats', 'statistics', 'fleet stats', 'status'], action: 'SHOW_STATS', description: 'Show fleet statistics', category: 'system' },
  { patterns: ['export', 'export data', 'download', 'save data'], action: 'EXPORT_DATA', description: 'Export fleet data', category: 'system' },
  { patterns: ['mute', 'mute sounds', 'silence', 'quiet'], action: 'MUTE', description: 'Mute sounds', category: 'system' },
  { patterns: ['unmute', 'enable sounds', 'sound on'], action: 'UNMUTE', description: 'Enable sounds', category: 'system' },
  { patterns: ['help', 'commands', 'what can you do', 'show commands', 'voice commands'], action: 'SHOW_HELP', description: 'Show available commands', category: 'system' },
  { patterns: ['dark mode', 'night mode'], action: 'DARK_MODE', description: 'Enable dark mode', category: 'system' },
];

// ============================================
// VOICE RECOGNITION HOOK
// ============================================

const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 3;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const transcriptText = result[0].transcript.toLowerCase().trim();
        setTranscript(transcriptText);
        setConfidence(result[0].confidence);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setConfidence(0);
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  return {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
  };
};

// ============================================
// VOICE COMMANDS COMPONENT
// ============================================

interface VoiceCommandsProps {
  onCommand?: (result: CommandResult) => void;
  showPanel?: boolean;
}

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({ 
  onCommand,
  showPanel = true 
}) => {
  const store = useStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  
  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
  } = useVoiceRecognition();
  
  // Process voice command
  const processCommand = useCallback((input: string): CommandResult | null => {
    const normalizedInput = input.toLowerCase().trim();
    
    for (const cmd of VOICE_COMMANDS) {
      for (const pattern of cmd.patterns) {
        if (normalizedInput.includes(pattern)) {
          return {
            command: normalizedInput,
            action: cmd.action,
            success: true,
            timestamp: Date.now(),
            confidence: confidence || 0.9,
          };
        }
      }
    }
    
    return {
      command: normalizedInput,
      action: 'UNKNOWN',
      success: false,
      timestamp: Date.now(),
      confidence: confidence || 0,
    };
  }, [confidence]);
  
  // Execute command action
  const executeAction = useCallback((action: string) => {
    const vehicles = store.vehicles;
    
    switch (action) {
      case 'START_SIMULATION':
        store.startSimulation();
        break;
      case 'STOP_SIMULATION':
        store.stopSimulation();
        break;
      case 'RESET_SIMULATION':
        store.resetSimulation();
        break;
      case 'STEP_SIMULATION':
        store.stepSimulation();
        break;
      case 'SPEED_UP':
        store.setSimulationSpeed(Math.min(10, store.simulationSpeed * 2));
        break;
      case 'SLOW_DOWN':
        store.setSimulationSpeed(Math.max(1, store.simulationSpeed / 2));
        break;
      case 'SPEED_1X':
        store.setSimulationSpeed(1);
        break;
      case 'SPEED_2X':
        store.setSimulationSpeed(2);
        break;
      case 'SPEED_5X':
        store.setSimulationSpeed(5);
        break;
      case 'SPEED_10X':
        store.setSimulationSpeed(10);
        break;
      case 'SCENARIO_1':
      case 'SCENARIO_2':
      case 'SCENARIO_3':
      case 'SCENARIO_4':
      case 'SCENARIO_5':
        const scenarioNum = action.split('_')[1];
        store.runScenario(scenarioNum);
        break;
      case 'TRIGGER_EMERGENCY':
        store.runScenario('5');
        break;
      case 'SELECT_VEHICLE_1':
      case 'SELECT_VEHICLE_2':
      case 'SELECT_VEHICLE_3':
      case 'SELECT_VEHICLE_4':
      case 'SELECT_VEHICLE_5':
      case 'SELECT_VEHICLE_6':
      case 'SELECT_VEHICLE_7':
      case 'SELECT_VEHICLE_8':
        const vehicleIndex = parseInt(action.split('_')[2]) - 1;
        if (vehicles[vehicleIndex]) {
          store.selectVehicle(vehicles[vehicleIndex].id);
        }
        break;
      case 'DESELECT_VEHICLE':
        store.selectVehicle(null);
        break;
      case 'SHOW_HELP':
        setShowHelp(true);
        break;
      case 'EXPORT_DATA':
        const data = JSON.stringify(store.vehicles, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fleet-data.json';
        a.click();
        break;
      default:
        console.log('Unknown voice command:', action);
    }
  }, [store]);
  
  // Handle transcript changes
  useEffect(() => {
    if (transcript && !isListening) {
      const result = processCommand(transcript);
      if (result) {
        setCommandHistory(prev => [result, ...prev.slice(0, 9)]);
        if (result.success) {
          executeAction(result.action);
        }
        onCommand?.(result);
      }
    }
  }, [transcript, isListening, processCommand, executeAction, onCommand]);
  
  // Audio level visualization
  useEffect(() => {
    if (isListening) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyzerRef.current);
        analyzerRef.current.fftSize = 256;
        
        const updateLevel = () => {
          if (analyzerRef.current && isListening) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
            animationRef.current = requestAnimationFrame(updateLevel);
          }
        };
        updateLevel();
      }).catch(console.error);
    } else {
      cancelAnimationFrame(animationRef.current);
      setAudioLevel(0);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening]);
  
  // Handle text input
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      const result = processCommand(textInput);
      if (result) {
        setCommandHistory(prev => [result, ...prev.slice(0, 9)]);
        if (result.success) {
          executeAction(result.action);
        }
        onCommand?.(result);
      }
      setTextInput('');
    }
  };
  
  if (!showPanel) return null;
  
  return (
    <>
      {/* Voice Button */}
      <motion.button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`fixed bottom-24 right-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-gradient-to-br from-purple-600 to-cyan-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: isListening 
            ? '0 0 30px rgba(255,0,0,0.5)' 
            : '0 0 20px rgba(0,240,255,0.3)'
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </motion.button>
      
      {/* Voice Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-40 right-6 z-40 w-80 glass-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  🎤 Voice Control
                  {isSupported ? (
                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Supported</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Not Supported</span>
                  )}
                </h3>
                <button onClick={() => setIsPanelOpen(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            
            {/* Audio Visualizer */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-center gap-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 rounded-full ${isListening ? 'bg-cyan-400' : 'bg-gray-600'}`}
                    animate={{
                      height: isListening 
                        ? Math.max(4, Math.sin((i + Date.now() / 100) * 0.5) * audioLevel * 50 + 10)
                        : 4
                    }}
                    transition={{ duration: 0.05 }}
                  />
                ))}
              </div>
              
              {/* Listen Button */}
              <motion.button
                onClick={isListening ? stopListening : startListening}
                disabled={!isSupported}
                className={`w-full py-3 rounded-lg font-bold transition-all mt-2 ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : isSupported
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {isListening ? '🔴 Stop Listening' : '🎤 Start Listening'}
              </motion.button>
            </div>
            
            {/* Current Transcript */}
            {transcript && (
              <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
                <div className="text-xs text-gray-400 mb-1">Heard:</div>
                <div className="text-cyan-400 font-mono">"{transcript}"</div>
                {confidence > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-xs text-gray-500">Confidence:</div>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(confidence * 100)}%</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-500/20 border-b border-red-500/30">
                <span className="text-red-400 text-sm">⚠️ {error}</span>
              </div>
            )}
            
            {/* Text Input Fallback */}
            <form onSubmit={handleTextSubmit} className="p-4 border-b border-gray-700/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                >
                  →
                </button>
              </div>
            </form>
            
            {/* Command History */}
            <div className="p-4 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Recent Commands</span>
                <button
                  onClick={() => setShowHelp(true)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  View All Commands
                </button>
              </div>
              <div className="space-y-2">
                {commandHistory.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-4">
                    No commands yet. Try saying "start simulation"
                  </div>
                ) : (
                  commandHistory.map((cmd, i) => (
                    <motion.div
                      key={cmd.timestamp}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`text-xs p-2 rounded ${
                        cmd.success 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-mono">"{cmd.command}"</span>
                        <span className={cmd.success ? 'text-green-400' : 'text-red-400'}>
                          {cmd.success ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="text-gray-500 mt-1">
                        → {cmd.action.replace(/_/g, ' ').toLowerCase()}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  🎤 Voice Commands Reference
                </h2>
                <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white text-2xl">
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Simulation Commands */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                      🎬 Simulation
                    </h3>
                    <div className="space-y-2">
                      {VOICE_COMMANDS.filter(c => c.category === 'simulation').map((cmd, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-400 font-mono bg-green-500/10 px-2 py-0.5 rounded">
                            {cmd.patterns[0]}
                          </span>
                          <span className="text-gray-400">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Vehicle Commands */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                      🚗 Vehicle Selection
                    </h3>
                    <div className="space-y-2">
                      {VOICE_COMMANDS.filter(c => c.category === 'vehicle').slice(0, 6).map((cmd, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded">
                            {cmd.patterns[0]}
                          </span>
                          <span className="text-gray-400">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Navigation Commands */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                      🗺️ Navigation
                    </h3>
                    <div className="space-y-2">
                      {VOICE_COMMANDS.filter(c => c.category === 'navigation').map((cmd, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-yellow-400 font-mono bg-yellow-500/10 px-2 py-0.5 rounded">
                            {cmd.patterns[0]}
                          </span>
                          <span className="text-gray-400">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* System Commands */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                      ⚙️ System
                    </h3>
                    <div className="space-y-2">
                      {VOICE_COMMANDS.filter(c => c.category === 'system').map((cmd, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded">
                            {cmd.patterns[0]}
                          </span>
                          <span className="text-gray-400">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Tips */}
                <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <h4 className="font-bold text-cyan-400 mb-2">💡 Tips</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Speak clearly and naturally</li>
                    <li>• Wait for the listening indicator before speaking</li>
                    <li>• Use keywords like "start", "stop", "scenario", "select"</li>
                    <li>• You can also type commands in the text input</li>
                    <li>• Say "help" anytime to see this reference</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceCommands;
