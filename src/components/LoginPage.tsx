import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@vehicleai.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'login' | '2fa' | 'success'>('login');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [rememberMe, setRememberMe] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Animated background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    const colors = ['#00f0ff', '#7b61ff', '#00ff88', '#ff3355'];

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    // Grid lines
    const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number; progress: number }> = [];
    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5;
      gridLines.push({
        x1: isHorizontal ? 0 : Math.random() * canvas.width,
        y1: isHorizontal ? Math.random() * canvas.height : 0,
        x2: isHorizontal ? canvas.width : Math.random() * canvas.width,
        y2: isHorizontal ? Math.random() * canvas.height : canvas.height,
        progress: Math.random()
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      gridLines.forEach(line => {
        line.progress += 0.002;
        if (line.progress > 1) line.progress = 0;

        const gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(line.progress, 'rgba(0, 240, 255, 0.3)');
        gradient.addColorStop(Math.min(line.progress + 0.1, 1), 'transparent');

        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw and update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw connections
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email && password.length >= 4) {
      setCurrentStep('2fa');
      setIsLoading(false);
    } else {
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentStep('success');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onLogin(email, password);
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await onLogin(`${provider.toLowerCase()}@vehicleai.com`, 'sso-token');
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a1a] overflow-hidden">
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
                  🚗
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#0a0a1a] flex items-center justify-center">
                  <span className="text-[8px]">AI</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  VehicleAI
                </h1>
                <p className="text-cyan-400 text-sm">Intelligent Fleet Ecosystem</p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              The Future of
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Transportation
              </span>
            </h2>

            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Harness the power of AI for predictive negotiations, intelligent fuel management, 
              and real-time fleet coordination.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🧠', title: 'AI Predictions', desc: 'Real-time traffic analysis' },
                { icon: '🤝', title: 'Smart Negotiation', desc: 'Vehicle-to-vehicle communication' },
                { icon: '⛽', title: 'Fuel Optimization', desc: 'Save up to 40% on fuel' },
                { icon: '🛡️', title: 'Safety First', desc: '99.9% accident prevention' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition-all group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                  <p className="text-gray-500 text-xs">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10">
              {[
                { value: '10K+', label: 'Vehicles' },
                { value: '99.9%', label: 'Uptime' },
                { value: '40%', label: 'Fuel Saved' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <AnimatePresence mode="wait">
              {currentStep === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#12122a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/50"
                >
                  {/* Mobile Logo */}
                  <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center text-2xl">
                      🚗
                    </div>
                    <span className="text-xl font-bold text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      VehicleAI
                    </span>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400">Sign in to access your dashboard</p>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { icon: '🔵', name: 'Google', color: 'hover:border-red-500/50' },
                      { icon: '⬛', name: 'Microsoft', color: 'hover:border-blue-500/50' },
                      { icon: '🔷', name: 'SSO', color: 'hover:border-purple-500/50' }
                    ].map((provider) => (
                      <button
                        key={provider.name}
                        onClick={() => handleSocialLogin(provider.name)}
                        disabled={isLoading}
                        className={`p-3 rounded-xl bg-white/5 border border-white/10 ${provider.color} transition-all hover:bg-white/10 disabled:opacity-50`}
                      >
                        <span className="text-lg">{provider.icon}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <span className="text-gray-500 text-sm">or continue with email</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email Input */}
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-gray-400 text-sm">Password</label>
                        <button type="button" className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
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
                      </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 transition-all ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500 group-hover:border-gray-400'}`}>
                            {rememberMe && (
                              <svg className="w-full h-full text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">Remember me for 30 days</span>
                      </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3"
                      >
                        <span className="text-red-400">⚠️</span>
                        <span className="text-red-400 text-sm">{error}</span>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full relative overflow-hidden rounded-xl py-4 text-white font-semibold transition-all disabled:opacity-70 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-[2px] bg-[#12122a] rounded-[10px] group-hover:bg-transparent transition-all" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign in
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </form>

                  {/* Demo Credentials */}
                  <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-cyan-400 text-sm text-center mb-2">🎮 Demo Credentials</p>
                    <div className="text-gray-400 text-xs text-center space-y-1">
                      <p>Email: <span className="text-white">admin@vehicleai.com</span></p>
                      <p>Password: <span className="text-white">demo123</span></p>
                      <p>2FA Code: <span className="text-white">Any 6 digits</span></p>
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <p className="text-center text-gray-400 text-sm mt-6">
                    Don't have an account?{' '}
                    <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                      Create account
                    </button>
                  </p>
                </motion.div>
              )}

              {currentStep === '2fa' && (
                <motion.div
                  key="2fa"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#12122a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/50"
                >
                  <button
                    onClick={() => setCurrentStep('login')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
                      🔐
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
                    <p className="text-gray-400">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-3 mb-8">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 bg-white/5 border-2 border-white/10 rounded-xl text-white text-center text-2xl font-bold focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpCode.some(d => !d)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl py-4 text-white font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <p className="text-center text-gray-500 text-sm mt-6">
                    Didn't receive a code?{' '}
                    <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      Resend code
                    </button>
                  </p>
                </motion.div>
              )}

              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#12122a]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-12 shadow-2xl shadow-black/50 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg shadow-green-500/30"
                  >
                    ✓
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                  <p className="text-gray-400 mb-6">Authentication successful. Redirecting to dashboard...</p>
                  <div className="flex justify-center">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="w-3 h-3 bg-cyan-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security Badges */}
            <div className="flex justify-center items-center gap-6 mt-8">
              {['🔒 SSL Secured', '🛡️ SOC 2', '🔐 256-bit'].map((badge, i) => (
                <motion.span
                  key={badge}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="text-gray-500 text-xs"
                >
                  {badge}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Version */}
      <div className="absolute bottom-4 left-4 text-gray-600 text-xs">
        v4.0.0 • © 2024 VehicleAI
      </div>
    </div>
  );
};

export default LoginPage;
