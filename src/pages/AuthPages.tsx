import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthPageProps {
  onNavigate: (route: string) => void;
}

export const AuthPages: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { login, register, resetPassword, signInWithGoogle, demoLogin } = useAuth();
  const { success, error: toastError } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        success('Welcome back to Sanu Builds!');
        onNavigate('/');
      } else if (mode === 'register') {
        if (!name.trim()) {
          toastError('Please enter your full name.');
          setLoading(false);
          return;
        }
        await register(email, password, name.trim());
        success('Account created successfully! Welcome.');
        onNavigate('/');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        success('Password reset instructions sent to your email.');
        setMode('login');
      }
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      success('Signed in with Google!');
      onNavigate('/');
    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Google authentication was cancelled or failed.');
    }
  };

  const handleDemoSignIn = async (role: 'admin' | 'customer') => {
    setLoading(true);
    try {
      await demoLogin(role);
      success(`Signed in as Demo ${role === 'admin' ? 'Administrator' : 'Customer'}!`);
      if (role === 'admin') {
        onNavigate('/admin');
      } else {
        onNavigate('/');
      }
    } catch (err: any) {
      console.error(err);
      toastError('Could not launch demo session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
          Sanu Builds Identity
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight uppercase">
          {mode === 'login' && 'Sign In to Sanu'}
          {mode === 'register' && 'Create Your Account'}
          {mode === 'forgot' && 'Reset Password'}
        </h1>
        <p className="text-xs text-neutral-500">
          {mode === 'login' && 'Access your orders, saved addresses, and tailored drops.'}
          {mode === 'register' && 'Join the community of creators and modern apparel builders.'}
          {mode === 'forgot' && 'Enter your registered email to receive reset instructions.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Google Quick Button */}
        {mode !== 'forgot' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 border border-neutral-300 hover:border-neutral-900 rounded-lg text-xs font-bold text-neutral-800 transition-colors flex items-center justify-center gap-2 bg-neutral-50 hover:bg-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-2 text-[10px] uppercase font-bold text-neutral-400 absolute">
                Or with email
              </span>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher links */}
        <div className="pt-2 text-center text-xs text-neutral-500 border-t border-neutral-100">
          {mode === 'login' && (
            <p>
              New to Sanu Builds?{' '}
              <button
                onClick={() => setMode('register')}
                className="font-bold text-neutral-950 hover:underline"
              >
                Create an account
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="font-bold text-neutral-950 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="font-bold text-neutral-950 hover:underline"
            >
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>

      {/* 1-Click Instant Demo Profiles for Quick Evaluation */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-800">
          <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
          <span>1-Click Demo Evaluation</span>
        </div>
        <p className="text-[11px] text-neutral-500">
          Instantly test the store as an Admin or Customer without creating an account:
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleDemoSignIn('admin')}
            className="p-2.5 bg-white border border-neutral-300 hover:border-neutral-900 rounded-lg text-left transition-colors group"
          >
            <span className="block text-xs font-black text-neutral-900 group-hover:text-black">
              👑 Demo Admin
            </span>
            <span className="text-[10px] text-neutral-500">Full management access</span>
          </button>

          <button
            onClick={() => handleDemoSignIn('customer')}
            className="p-2.5 bg-white border border-neutral-300 hover:border-neutral-900 rounded-lg text-left transition-colors group"
          >
            <span className="block text-xs font-black text-neutral-900 group-hover:text-black">
              👤 Demo Customer
            </span>
            <span className="text-[10px] text-neutral-500">Cart, wishlist & orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};
