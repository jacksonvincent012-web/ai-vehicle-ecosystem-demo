// ============================================
// PROFESSIONAL LOGIN SCREEN
// AI-Powered Vehicle Ecosystem v4.0
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

// ============================================
// ANIMATED BACKGROUND WITH ROAD NETWORK
// ============================================
const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
    }

    // Cars on roads
    interface Car {
      x: number;
      y: number;
      direction: 'left' | 'right' | 'up' | 'down';
      speed: number;
      color: string;
      trail: { x: number; y: number }[];
    }

    // Road segments
    interface Road {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      isHorizontal: boolean;
    }

    const colors = ['#00f0ff', '#7b61ff', '#00ff88', '#ff3355', '#ffaa00'];
    const particles: Particle[] = [];
    const cars: Car[] = [];
    const roads: Road[] = [];

    // Create grid of roads
    const gridSize = 150;
    for (let x = gridSize; x < canvas.width; x += gridSize) {
      roads.push({ x1: x, y1: 0, x2: x, y2: canvas.height, isHorizontal: false });
    }
    for (let y = gridSize; y < canvas.height; y += gridSize) {
      roads.push({ x1: 0, y1: y, x2: canvas.width, y2: y, isHorizontal: true });
    }

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    // Create cars
    for (let i = 0; i < 15; i++) {
      const road = roads[Math.floor(Math.random() * roads.length)];
      const isHorizontal = road.isHorizontal;
      cars.push({
        x: isHorizontal ? Math.random() * canvas.width : road.x1,
        y: isHorizontal ? road.y1 : Math.random() * canvas.height,
        direction: isHorizontal ? (Math.random() > 0.5 ? 'right' : 'left') : (Math.random() > 0.5 ? 'down' : 'up'),
        speed: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: []
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw roads
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 20;
      roads.forEach(road => {
        ctx.beginPath();
        ctx.moveTo(road.x1, road.y1);
        ctx.lineTo(road.x2, road.y2);
        ctx.stroke();
      });

      // Draw road center lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 10]);
      roads.forEach(road => {
        ctx.beginPath();
        ctx.moveTo(road.x1, road.y1);
        ctx.lineTo(road.x2, road.y2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Update and draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw connections between close particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Update and draw cars
      cars.forEach(car => {
        // Update trail
        car.trail.unshift({ x: car.x, y: car.y });
        if (car.trail.length > 20) car.trail.pop();

        // Move car
        switch (car.direction) {
          case 'right': car.x += car.speed; break;
          case 'left': car.x -= car.speed; break;
          case 'down': car.y += car.speed; break;
          case 'up': car.y -= car.speed; break;
        }

        // Wrap around
        if (car.x > canvas.width + 10) car.x = -10;
        if (car.x < -10) car.x = canvas.width + 10;
        if (car.y > canvas.height + 10) car.y = -10;
        if (car.y < -10) car.y = canvas.height + 10;

        // Draw trail
        car.trail.forEach((t, i) => {
          const alpha = 0.3 * (1 - i / car.trail.length);
          ctx.beginPath();
          ctx.arc(t.x, t.y, 3 - i * 0.1, 0, Math.PI * 2);
          ctx.fillStyle = car.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw car
        ctx.beginPath();
        ctx.arc(car.x, car.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = car.color;
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw glow
        const gradient = ctx.createRadialGradient(car.x, car.y, 0, car.x, car.y, 20);
        gradient.addColorStop(0, car.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(car.x - 20, car.y - 20, 40, 40);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
};

// ============================================
// GLOWING ORB EFFECT
// ============================================
const GlowingOrb: React.FC<{ color: string; size: number; top: string; left: string; delay: number }> = 
  ({ color, size, top, left, delay }) => (
  <motion.div
    className="absolute rounded-full blur-3xl"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${color}40, transparent)`,
      top,
      left,
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
    }}
  />
);

// ============================================
// FLOATING ICONS
// ============================================
const FloatingIcon: React.FC<{ icon: string; delay: number; x: number; y: number }> = ({ icon, delay, x, y }) => (
  <motion.div
    className="absolute text-4xl opacity-20 pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{
      y: [-10, 10, -10],
      rotate: [-5, 5, -5],
      opacity: [0.1, 0.3, 0.1],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      delay,
    }}
  >
    {icon}
  </motion.div>
);

// ============================================
// FEATURE CARD
// ============================================
const FeatureCard: React.FC<{ icon: string; title: string; description: string; delay: number }> = 
  ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
  >
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-white text-sm font-semibold">{title}</div>
      <div className="text-gray-400 text-xs">{description}</div>
    </div>
  </motion.div>
);

// ============================================
// TYPING EFFECT
// ============================================
const TypingEffect: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(cursorTimer);
    };
  }, [text]);

  return (
    <span className={className}>
      {displayText}
      <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
    </span>
  );
};

// ============================================
// STATS COUNTER
// ============================================
const StatsCounter: React.FC<{ value: number; label: string; suffix?: string; prefix?: string }> = 
  ({ value, label, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
};

// ============================================
// INPUT FIELD
// ============================================
const InputField: React.FC<{
  type: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  error?: string;
}> = ({ type, label, value, onChange, icon, placeholder, error }) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-gray-300 text-sm font-medium">{label}</label>
      <div className={`relative rounded-xl transition-all duration-300 ${
        focused 
          ? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20' 
          : error 
            ? 'ring-2 ring-red-500' 
            : ''
      }`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none transition-all"
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-red-400 text-xs flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ============================================
// MAIN LOGIN COMPONENT
// ============================================
export const ProfessionalLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@fleet.io');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'sso' | 'biometric'>('credentials');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const login = useStore(s => s.login);

  // Floating icons data
  const floatingIcons = [
    { icon: '🚗', x: 10, y: 20, delay: 0 },
    { icon: '🚚', x: 85, y: 15, delay: 0.5 },
    { icon: '🚌', x: 15, y: 75, delay: 1 },
    { icon: '🚑', x: 90, y: 70, delay: 1.5 },
    { icon: '⛽', x: 5, y: 45, delay: 2 },
    { icon: '🛣️', x: 92, y: 40, delay: 2.5 },
    { icon: '📊', x: 8, y: 90, delay: 3 },
    { icon: '🤖', x: 88, y: 85, delay: 3.5 },
  ];

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate 2FA for demo
    if (!showTwoFactor && email === 'admin@fleet.io') {
      setIsLoading(false);
      setShowTwoFactor(true);
      toast.success('2FA code sent to your device', { icon: '🔐' });
      return;
    }

    const ok = await login(email, password);
    setIsLoading(false);

    if (ok) {
      toast.success('Welcome to AI Vehicle Ecosystem!', { icon: '🚀' });
    } else {
      toast.error('Invalid credentials. Please try again.');
      setErrors({ password: 'Invalid email or password' });
    }
  };

  const handle2FASubmit = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const ok = await login(email, password);
    setIsLoading(false);
    if (ok) {
      toast.success('Welcome to AI Vehicle Ecosystem!', { icon: '🚀' });
    }
  };

  const handleSSOLogin = async (provider: string) => {
    toast.loading(`Connecting to ${provider}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.dismiss();
    const ok = await login('admin@fleet.io', 'demo1234');
    if (ok) toast.success(`Signed in with ${provider}!`, { icon: '🚀' });
  };

  const handleBiometricLogin = async () => {
    toast.loading('Authenticating with biometrics...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.dismiss();
    const ok = await login('admin@fleet.io', 'demo1234');
    if (ok) toast.success('Biometric authentication successful!', { icon: '🔓' });
  };

  return (
    <div className="fixed inset-0 bg-[#050510] overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Glowing orbs */}
      <GlowingOrb color="#00f0ff" size={400} top="-10%" left="-10%" delay={0} />
      <GlowingOrb color="#7b61ff" size={300} top="60%" left="80%" delay={1} />
      <GlowingOrb color="#00ff88" size={250} top="80%" left="10%" delay={2} />
      <GlowingOrb color="#ff3355" size={200} top="20%" left="70%" delay={3} />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => (
        <FloatingIcon key={i} {...item} />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Features (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center p-12 xl:p-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <span className="text-3xl">🚗</span>
              </motion.div>
              <div>
                <h1 className="text-3xl xl:text-4xl font-bold text-white" style={{ fontFamily: 'Orbitron' }}>
                  AI Vehicle
                </h1>
                <h2 className="text-2xl xl:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500" style={{ fontFamily: 'Orbitron' }}>
                  Ecosystem
                </h2>
              </div>
            </div>

            {/* Tagline with typing effect */}
            <div className="mb-8">
              <TypingEffect 
                text="Predictive Negotiation & Intelligent Fuel Management" 
                className="text-xl text-gray-300"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <StatsCounter value={10000} label="Vehicles Managed" prefix="" suffix="+" />
              <StatsCounter value={99} label="Uptime" suffix="%" />
              <StatsCounter value={40} label="Fuel Saved" suffix="%" />
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <FeatureCard 
                icon="🤖" 
                title="AI-Powered Decisions" 
                description="Real-time traffic prediction and route optimization"
                delay={0.2}
              />
              <FeatureCard 
                icon="🤝" 
                title="Smart Negotiation" 
                description="Autonomous vehicle-to-vehicle communication"
                delay={0.3}
              />
              <FeatureCard 
                icon="⛽" 
                title="Fuel Optimization" 
                description="Reduce costs with intelligent refueling strategies"
                delay={0.4}
              />
              <FeatureCard 
                icon="🔒" 
                title="Enterprise Security" 
                description="SOC2 compliant with end-to-end encryption"
                delay={0.5}
              />
            </div>

            {/* Trusted by */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <p className="text-gray-500 text-sm mb-4">Trusted by leading organizations</p>
              <div className="flex items-center gap-6 opacity-50">
                <span className="text-2xl grayscale">🏢</span>
                <span className="text-gray-400 font-semibold">TechCorp</span>
                <span className="text-2xl grayscale">🚛</span>
                <span className="text-gray-400 font-semibold">LogiFleet</span>
                <span className="text-2xl grayscale">🏙️</span>
                <span className="text-gray-400 font-semibold">SmartCity</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Login Card */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-gray-800 p-6">
                <div className="lg:hidden flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xl">🚗</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Orbitron' }}>AI Vehicle Ecosystem</h1>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                <p className="text-gray-400 text-sm mt-1">Sign in to access your fleet dashboard</p>
              </div>

              {/* Login Methods Tabs */}
              <div className="flex border-b border-gray-800">
                {[
                  { id: 'credentials', label: 'Credentials', icon: '🔐' },
                  { id: 'sso', label: 'SSO', icon: '🔗' },
                  { id: 'biometric', label: 'Biometric', icon: '👆' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setLoginMethod(method.id as typeof loginMethod)}
                    className={`flex-1 py-3 text-sm font-medium transition-all ${
                      loginMethod === method.id
                        ? 'text-cyan-400 bg-cyan-500/10 border-b-2 border-cyan-500'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="mr-1">{method.icon}</span>
                    {method.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* 2FA Screen */}
                  {showTwoFactor ? (
                    <motion.div
                      key="2fa"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                          <span className="text-3xl">🔐</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                        <p className="text-gray-400 text-sm mt-1">Enter the 6-digit code from your authenticator app</p>
                      </div>

                      {/* OTP Input */}
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                          <input
                            key={i}
                            type="text"
                            maxLength={1}
                            value={twoFactorCode[i] || ''}
                            onChange={e => {
                              const newCode = twoFactorCode.split('');
                              newCode[i] = e.target.value;
                              setTwoFactorCode(newCode.join(''));
                              // Auto-focus next input
                              if (e.target.value && e.target.nextElementSibling) {
                                (e.target.nextElementSibling as HTMLInputElement).focus();
                              }
                            }}
                            className="w-12 h-14 text-center text-xl font-bold bg-gray-800/60 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        ))}
                      </div>

                      <button
                        onClick={handle2FASubmit}
                        disabled={twoFactorCode.length < 6 || isLoading}
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                          </>
                        ) : 'Verify & Sign In'}
                      </button>

                      <button
                        onClick={() => setShowTwoFactor(false)}
                        className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        ← Back to login
                      </button>
                    </motion.div>
                  ) : loginMethod === 'credentials' ? (
                    <motion.form
                      key="credentials"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >
                      <InputField
                        type="email"
                        label="Email Address"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@company.com"
                        error={errors.email}
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        }
                      />

                      <InputField
                        type="password"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        error={errors.password}
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        }
                      />

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={e => setRememberMe(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-md border transition-all ${
                              rememberMe 
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 border-transparent' 
                                : 'bg-gray-800 border-gray-600 group-hover:border-gray-500'
                            }`}>
                              {rememberMe && (
                                <svg className="w-5 h-5 text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-400 group-hover:text-gray-300">Remember me</span>
                        </label>
                        <button type="button" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                          Forgot password?
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>

                      {/* Demo Credentials */}
                      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                        <div className="flex items-center gap-2 text-cyan-400 text-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">Demo Mode</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Use <span className="text-white font-mono">admin@fleet.io</span> / <span className="text-white font-mono">demo1234</span>
                        </p>
                      </div>
                    </motion.form>
                  ) : loginMethod === 'sso' ? (
                    <motion.div
                      key="sso"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <p className="text-gray-400 text-sm text-center mb-6">
                        Sign in with your corporate identity provider
                      </p>

                      {[
                        { name: 'Microsoft', icon: '🪟', color: 'from-blue-600 to-blue-700' },
                        { name: 'Google', icon: '🔵', color: 'from-red-500 to-yellow-500' },
                        { name: 'Okta', icon: '🔷', color: 'from-blue-500 to-blue-600' },
                        { name: 'Auth0', icon: '🔶', color: 'from-orange-500 to-red-500' },
                      ].map(provider => (
                        <button
                          key={provider.name}
                          onClick={() => handleSSOLogin(provider.name)}
                          className={`w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r ${provider.color} hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg`}
                        >
                          <span className="text-xl">{provider.icon}</span>
                          Continue with {provider.name}
                        </button>
                      ))}

                      <p className="text-center text-gray-500 text-xs mt-4">
                        Your organization's SSO policies will apply
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="biometric"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 text-center py-6"
                    >
                      <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/30"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-5xl">👆</span>
                      </motion.div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">Biometric Authentication</h3>
                        <p className="text-gray-400 text-sm mt-1">Use your fingerprint, face, or device PIN to sign in</p>
                      </div>

                      <button
                        onClick={handleBiometricLogin}
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                        Authenticate
                      </button>

                      <div className="flex items-center gap-3 justify-center text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          FIDO2 Certified
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          WebAuthn
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-800/30 border-t border-gray-800 px-6 py-4">
                <p className="text-center text-gray-500 text-xs">
                  By signing in, you agree to our{' '}
                  <button className="text-cyan-400 hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button className="text-cyan-400 hover:underline">Privacy Policy</button>
                </p>
              </div>
            </div>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SOC2 Compliant
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                256-bit Encryption
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                GDPR Ready
              </span>
            </div>

            {/* Version */}
            <p className="text-center text-gray-600 text-xs mt-4">
              AI Vehicle Ecosystem v4.0 • © 2024 FleetAI Technologies
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalLogin;
