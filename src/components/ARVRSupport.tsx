// ============================================
// AR/VR SUPPORT v4.0
// WebXR Integration for Immersive Experience
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// ============================================
// TYPES
// ============================================

interface XRSessionInfo {
  mode: 'vr' | 'ar' | null;
  isSupported: boolean;
  isActive: boolean;
  features: string[];
}

interface ControllerState {
  hand: 'left' | 'right';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  buttons: boolean[];
  axes: number[];
}

// ============================================
// XR HOOK
// ============================================

const useXRSupport = () => {
  const [vrSupported, setVRSupported] = useState(false);
  const [arSupported, setARSupported] = useState(false);
  const [activeSession, setActiveSession] = useState<XRSessionInfo>({
    mode: null,
    isSupported: false,
    isActive: false,
    features: []
  });
  const [controllers, setControllers] = useState<ControllerState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  
  // Check XR support
  useEffect(() => {
    const checkSupport = async () => {
      if ('xr' in navigator) {
        try {
          const vrOK = await (navigator as Navigator & { xr: XRSystem }).xr.isSessionSupported('immersive-vr');
          setVRSupported(vrOK);
        } catch {
          setVRSupported(false);
        }
        
        try {
          const arOK = await (navigator as Navigator & { xr: XRSystem }).xr.isSessionSupported('immersive-ar');
          setARSupported(arOK);
        } catch {
          setARSupported(false);
        }
      }
    };
    
    checkSupport();
  }, []);
  
  // Start VR session
  const startVR = useCallback(async () => {
    if (!vrSupported) {
      setError('VR not supported on this device');
      return false;
    }
    
    try {
      const xr = (navigator as Navigator & { xr: XRSystem }).xr;
      const session = await xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'bounded-floor']
      });
      
      sessionRef.current = session;
      setActiveSession({
        mode: 'vr',
        isSupported: true,
        isActive: true,
        features: ['local-floor']
      });
      
      session.addEventListener('end', () => {
        setActiveSession(prev => ({ ...prev, isActive: false, mode: null }));
        sessionRef.current = null;
      });
      
      // Setup input sources (controllers)
      session.addEventListener('inputsourceschange', (event) => {
        const sources = (event as XRInputSourcesChangeEvent).session.inputSources;
        const newControllers: ControllerState[] = [];
        
        for (const source of sources) {
          if (source.handedness !== 'none') {
            newControllers.push({
              hand: source.handedness as 'left' | 'right',
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              buttons: [],
              axes: []
            });
          }
        }
        
        setControllers(newControllers);
      });
      
      return true;
    } catch (err) {
      setError(`Failed to start VR: ${err}`);
      return false;
    }
  }, [vrSupported]);
  
  // Start AR session
  const startAR = useCallback(async () => {
    if (!arSupported) {
      setError('AR not supported on this device');
      return false;
    }
    
    try {
      const xr = (navigator as Navigator & { xr: XRSystem }).xr;
      const session = await xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'local-floor'],
        optionalFeatures: ['dom-overlay', 'light-estimation']
      });
      
      sessionRef.current = session;
      setActiveSession({
        mode: 'ar',
        isSupported: true,
        isActive: true,
        features: ['hit-test', 'local-floor']
      });
      
      session.addEventListener('end', () => {
        setActiveSession(prev => ({ ...prev, isActive: false, mode: null }));
        sessionRef.current = null;
      });
      
      return true;
    } catch (err) {
      setError(`Failed to start AR: ${err}`);
      return false;
    }
  }, [arSupported]);
  
  // End session
  const endSession = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.end();
      sessionRef.current = null;
    }
  }, []);
  
  return {
    vrSupported,
    arSupported,
    activeSession,
    controllers,
    error,
    startVR,
    startAR,
    endSession,
    clearError: () => setError(null)
  };
};

// ============================================
// AR/VR CONTROL PANEL COMPONENT
// ============================================

export const ARVRSupport: React.FC = () => {
  const store = useStore();
  const [showPanel, setShowPanel] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const {
    vrSupported,
    arSupported,
    activeSession,
    controllers,
    error,
    startVR,
    startAR,
    endSession,
    clearError
  } = useXRSupport();
  
  const handleStartVR = async () => {
    const success = await startVR();
    if (success) {
      store.setMapMode('3d');
    }
  };
  
  const handleStartAR = async () => {
    const success = await startAR();
    if (success) {
      store.setMapMode('3d');
    }
  };
  
  return (
    <>
      {/* AR/VR Button */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-24 left-6 z-40 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          activeSession.isActive 
            ? 'bg-gradient-to-br from-green-500 to-cyan-500 animate-pulse' 
            : 'bg-gradient-to-br from-indigo-600 to-purple-600'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: activeSession.isActive 
            ? '0 0 30px rgba(0,255,136,0.5)' 
            : '0 0 20px rgba(123,97,255,0.3)'
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </motion.button>
      
      {/* AR/VR Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            className="fixed bottom-40 left-6 z-40 w-80 glass-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  🥽 AR/VR Mode
                </h3>
                <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Immersive vehicle fleet visualization
              </p>
            </div>
            
            {/* Session Status */}
            {activeSession.isActive && (
              <div className="p-4 bg-green-500/10 border-b border-green-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-medium">
                    {activeSession.mode?.toUpperCase()} Session Active
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {activeSession.features.map((feature, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
                {controllers.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    Controllers: {controllers.map(c => c.hand).join(', ')}
                  </div>
                )}
                <button
                  onClick={endSession}
                  className="mt-3 w-full py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                >
                  Exit {activeSession.mode?.toUpperCase()}
                </button>
              </div>
            )}
            
            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-500/20 border-b border-red-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 text-sm">⚠️ {error}</span>
                  <button onClick={clearError} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
            )}
            
            {/* Mode Selection */}
            {!activeSession.isActive && (
              <div className="p-4 space-y-4">
                {/* VR Mode */}
                <div className={`p-4 rounded-lg border ${
                  vrSupported 
                    ? 'border-purple-500/30 bg-purple-500/10' 
                    : 'border-gray-700/30 bg-gray-800/30 opacity-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎮</span>
                      <div>
                        <h4 className="font-bold text-purple-400">VR Mode</h4>
                        <p className="text-xs text-gray-400">Full immersive experience</p>
                      </div>
                    </div>
                    {vrSupported ? (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Ready</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Unavailable</span>
                    )}
                  </div>
                  
                  <ul className="text-xs text-gray-400 space-y-1 mb-3">
                    <li>• Walk around the 3D city</li>
                    <li>• Controller interaction</li>
                    <li>• Hand tracking support</li>
                    <li>• 360° vehicle inspection</li>
                  </ul>
                  
                  <button
                    onClick={handleStartVR}
                    disabled={!vrSupported}
                    className={`w-full py-2 rounded font-bold transition-all ${
                      vrSupported
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Enter VR
                  </button>
                </div>
                
                {/* AR Mode */}
                <div className={`p-4 rounded-lg border ${
                  arSupported 
                    ? 'border-cyan-500/30 bg-cyan-500/10' 
                    : 'border-gray-700/30 bg-gray-800/30 opacity-50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📱</span>
                      <div>
                        <h4 className="font-bold text-cyan-400">AR Mode</h4>
                        <p className="text-xs text-gray-400">Overlay on real world</p>
                      </div>
                    </div>
                    {arSupported ? (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Ready</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Unavailable</span>
                    )}
                  </div>
                  
                  <ul className="text-xs text-gray-400 space-y-1 mb-3">
                    <li>• Place fleet in your space</li>
                    <li>• Surface detection</li>
                    <li>• Real-world scale</li>
                    <li>• Tap to select vehicles</li>
                  </ul>
                  
                  <button
                    onClick={handleStartAR}
                    disabled={!arSupported}
                    className={`w-full py-2 rounded font-bold transition-all ${
                      arSupported
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Enter AR
                  </button>
                </div>
              </div>
            )}
            
            {/* Compatible Devices */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Compatible Devices</span>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Setup Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-gray-800 rounded">Meta Quest</span>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded">HTC Vive</span>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded">Valve Index</span>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded">Windows MR</span>
                <span className="text-xs px-2 py-1 bg-gray-800 rounded">Mobile AR</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* VR Controls Overlay (when in VR) */}
      {activeSession.isActive && activeSession.mode === 'vr' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-end justify-center pb-20">
          <div className="glass-card p-4 pointer-events-auto">
            <div className="text-center text-sm">
              <div className="text-cyan-400 font-bold mb-2">VR Controls</div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <span className="text-purple-400">Grip</span>: Select
                </div>
                <div>
                  <span className="text-purple-400">Trigger</span>: Interact
                </div>
                <div>
                  <span className="text-purple-400">Thumbstick</span>: Move
                </div>
                <div>
                  <span className="text-purple-400">Menu</span>: Options
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  🥽 AR/VR Setup Guide
                </h2>
                <button onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white text-2xl">
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                {/* VR Setup */}
                <div>
                  <h3 className="text-lg font-bold text-purple-400 mb-3">🎮 VR Headset Setup</h3>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-purple-400 font-bold">1.</span>
                      Connect your VR headset to your computer
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-400 font-bold">2.</span>
                      Ensure SteamVR or Oculus software is running
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-400 font-bold">3.</span>
                      Open this page in a WebXR-compatible browser (Chrome, Edge)
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-400 font-bold">4.</span>
                      Click "Enter VR" to begin the experience
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-400 font-bold">5.</span>
                      Put on your headset and grab your controllers
                    </li>
                  </ol>
                </div>
                
                {/* AR Setup */}
                <div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-3">📱 AR Mode Setup</h3>
                  <ol className="space-y-2 text-sm text-gray-300">
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">1.</span>
                      Use a WebXR-compatible mobile device or AR headset
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">2.</span>
                      Grant camera permissions when prompted
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">3.</span>
                      Click "Enter AR" to start the experience
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">4.</span>
                      Point your camera at a flat surface
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400 font-bold">5.</span>
                      Tap to place the vehicle fleet
                    </li>
                  </ol>
                </div>
                
                {/* VR Controls */}
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">🎮 VR Controls</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-yellow-400 font-bold mb-1">Movement</div>
                      <div className="text-gray-400">Left thumbstick: Move around</div>
                      <div className="text-gray-400">Right thumbstick: Turn/Snap turn</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-yellow-400 font-bold mb-1">Selection</div>
                      <div className="text-gray-400">Point at vehicle + Trigger: Select</div>
                      <div className="text-gray-400">Grip: Grab and move</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-yellow-400 font-bold mb-1">Simulation</div>
                      <div className="text-gray-400">A/X button: Play/Pause</div>
                      <div className="text-gray-400">B/Y button: Step forward</div>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="text-yellow-400 font-bold mb-1">UI</div>
                      <div className="text-gray-400">Menu button: Show/Hide panels</div>
                      <div className="text-gray-400">Thumbstick click: Reset view</div>
                    </div>
                  </div>
                </div>
                
                {/* Troubleshooting */}
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h4 className="font-bold text-red-400 mb-2">⚠️ Troubleshooting</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>VR not detected:</strong> Check USB connection and drivers</li>
                    <li>• <strong>Black screen:</strong> Restart SteamVR/Oculus software</li>
                    <li>• <strong>Low FPS:</strong> Close other applications, lower graphics</li>
                    <li>• <strong>AR not working:</strong> Ensure good lighting, clear surfaces</li>
                    <li>• <strong>Permission denied:</strong> Allow camera access in browser settings</li>
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

// ============================================
// VR SCENE COMPONENT (For Three.js Integration)
// ============================================

interface VRSceneProps {
  children?: React.ReactNode;
}

export const VRScene: React.FC<VRSceneProps> = ({ children }) => {
  // This component would integrate with @react-three/xr for full VR scene
  // For now, it provides a placeholder for the VR experience
  
  return (
    <div className="vr-scene">
      {children}
      {/* VR-specific UI elements would go here */}
    </div>
  );
};

// ============================================
// AR OVERLAY COMPONENT
// ============================================

interface AROverlayProps {
  children?: React.ReactNode;
}

export const AROverlay: React.FC<AROverlayProps> = ({ children }) => {
  // AR-specific UI overlay
  return (
    <div className="ar-overlay fixed inset-0 pointer-events-none">
      {children}
      {/* AR placement indicators, etc. */}
    </div>
  );
};

export default ARVRSupport;
