import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, Building2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Parse query params to check for mode=register
  useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') {
      setIsSignUp(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName, agencyName);
      } else {
        await signIn(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white group-hover:text-purple-400 transition-colors">
              Triponic
            </span>
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400">
              {isSignUp ? 'Start your 14-day free trial. No credit card required.' : 'Enter your details to access your dashboard.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-5 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        placeholder="John Doe"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Agency Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        placeholder="Global Travels Inc."
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Password</label>
                {!isSignUp && (
                  <Link to="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-10 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-600/20 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[150px]" />

        <div className="relative z-10 max-w-lg text-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-10"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl mx-auto flex items-center justify-center border border-white/10 backdrop-blur-xl mb-8 shadow-2xl">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Manage your agency with confidence
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              "Triponic has completely transformed how we operate. The AI itinerary builder alone saves us 20+ hours a week."
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                  U{i}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500">★</div>)}
              </div>
              <p className="text-sm text-slate-400">Trusted by 500+ agencies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
