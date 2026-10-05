import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  X, 
  Terminal, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AIRobot, RobotState } from '../robot/AIRobot';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, forgotPassword, updatePassword } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if opened from password reset link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('reset-password') || hash.includes('type=recovery')) {
        setMode('reset');
      }
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setInfoMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine robot state and message according to specification (Section 9)
  const getRobotStatus = (): { state: RobotState; message: string } => {
    if (isLoading) {
      return { state: 'processing', message: 'Authenticating...' };
    }
    if (isSuccess) {
      return { state: 'success', message: 'Access granted.' };
    }
    if (error) {
      return { 
        state: 'alert', 
        message: 'Authentication failed. Please check your email and password.' 
      };
    }
    if (mode === 'register') {
      return { state: 'idle', message: 'Mission Control standing by. Create your owner account.' };
    }
    if (mode === 'forgot') {
      return { state: 'idle', message: 'Mission Control standing by. Enter email for password recovery.' };
    }
    if (mode === 'reset') {
      return { state: 'idle', message: 'Mission Control standing by. Enter your new password.' };
    }
    return { state: 'idle', message: 'Mission Control standing by.' };
  };

  const robotStatus = getRobotStatus();

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Invalid email or password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await login(email, password);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 600);
      } else {
        // Strict specification: show clean "Invalid email or password."
        setError(res.error || 'Invalid email or password.');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Create Owner Account
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await register(email, password);
      if (res.success) {
        if (res.requiresEmailVerification) {
          setInfoMessage('Account created! Please check your email for the confirmation link to complete registration.');
        } else {
          setIsSuccess(true);
          setTimeout(() => {
            onSuccess();
          }, 600);
        }
      } else {
        setError(res.error || 'Failed to create account.');
      }
    } catch {
      setError('Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setInfoMessage('Password reset instructions have been sent to your email.');
      } else {
        setError(res.error || 'Failed to send password reset email.');
      }
    } catch {
      setError('Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Password Reset Confirmation
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setInfoMessage('Password updated successfully! Please sign in with your new password.');
        setMode('login');
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch {
      setError('Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-space-900 border border-cyan-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 animate-scaleIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-login-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-space-850 cursor-pointer"
          aria-label="Close authentication terminal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Cute AI Robot */}
        <div className="flex items-center gap-4">
          <AIRobot
            variant="nova"
            size="sm"
            state={robotStatus.state}
            message={robotStatus.message}
            interactive={true}
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-[10px] font-mono text-cyan-300 uppercase tracking-widest mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>
                {mode === 'login' && 'OWNER ACCESS'}
                {mode === 'register' && 'ACCOUNT SETUP'}
                {mode === 'forgot' && 'ACCOUNT RECOVERY'}
                {mode === 'reset' && 'NEW CREDENTIALS'}
              </span>
            </div>
            <h2 id="modal-login-title" className="text-xl font-bold font-display text-white">
              {mode === 'login' && 'MY LOGIN'}
              {mode === 'register' && 'Create your Mission Control account'}
              {mode === 'forgot' && 'Forgot Password'}
              {mode === 'reset' && 'Create New Password'}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              {mode === 'login' && 'VEERA MISSION CONTROL GATEWAY'}
              {mode === 'register' && 'Establish authorized commander credentials'}
              {mode === 'forgot' && 'Request secure password reset link'}
              {mode === 'reset' && 'Set new password for Mission Control'}
            </p>
          </div>
        </div>

        {/* Telemetry notification banner */}
        <div className="px-3.5 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 font-sans flex items-start gap-2.5">
          <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            {mode === 'login' && 'Enter your verified owner email and password to access Mission Control.'}
            {mode === 'register' && 'Create your secure account. Credentials are encrypted and protected by Supabase Auth.'}
            {mode === 'forgot' && 'Enter your registered email address to receive password reset instructions.'}
            {mode === 'reset' && 'Enter your new password below to restore access.'}
          </span>
        </div>

        {/* Error Feedback Banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 font-mono animate-shake">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Info / Success Feedback Banner */}
        {infoMessage && (
          <div className="px-4 py-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ==================================================== */}
        {/* 1. LOGIN MODE */}
        {/* ==================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@veera.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="btn-control-universe w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ENTER MISSION CONTROL</span>
                </>
              )}
            </button>

            {/* Navigation links: Create Owner Account & Forgot Password */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Create Owner Account
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* 2. CREATE OWNER ACCOUNT MODE */}
        {/* ==================================================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@veera.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="btn-control-universe w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Account Created</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CREATE ACCOUNT</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-800/80 text-xs font-mono">
              <span className="text-slate-400">Already have an owner account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 underline transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* 3. FORGOT PASSWORD MODE */}
        {/* ==================================================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Owner Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@veera.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-control-universe w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>SEND RESET LINK</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-800/80 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* 4. NEW PASSWORD RESET MODE (From Email Link) */}
        {/* ==================================================== */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-950 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-control-universe w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-glow-cyan"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SAVE NEW PASSWORD</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-800/80 text-xs font-mono">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* Back to Universe Option */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-cyan-300 font-mono transition-colors cursor-pointer"
          >
            ← Return to Universe Observation
          </button>
        </div>
      </div>
    </div>
  );
};
