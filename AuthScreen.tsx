import React, { useState } from 'react';
import { Activity, Mail, ArrowRight, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { storageService } from '../services/storageService';

interface AuthScreenProps {
  onAuthenticated: (email: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      // LOGIN FLOW
      const exists = storageService.verifyUser(email);
      if (exists) {
        setSuccessMsg('Login successful. Welcome back to Medico Assistant.');
        setTimeout(() => {
          onAuthenticated(email);
        }, 1000);
      } else {
        setError('This email is not registered. Please Sign Up to continue.');
        setIsLoading(false);
      }
    } else {
      // SIGN UP FLOW
      const registered = storageService.registerUser(email);
      if (!registered) {
        setError('This email is already registered. Please Login.');
        setIsLogin(true);
        setIsLoading(false);
      } else {
        setSuccessMsg('Your email has been successfully registered. Accessing Medico...');
        setTimeout(() => {
            onAuthenticated(email);
        }, 1500);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-lg">
                    <Activity size={32} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">Medico Assistant</h1>
                <p className="text-emerald-100 text-sm">Your AI Healthcare Companion</p>
            </div>
        </div>

        {/* Form */}
        <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2 text-center">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 text-center text-sm mb-8">
                {isLogin 
                    ? 'Please Login using your email to continue.' 
                    : 'Sign Up with your email to access health features.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail size={20} />
                    </div>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white"
                        required
                    />
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-rose-500 text-sm bg-rose-50 p-3 rounded-lg">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="flex items-start gap-2 text-emerald-600 text-sm bg-emerald-50 p-3 rounded-lg">
                        <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading || !!successMsg}
                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all transform active:scale-95 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                >
                    {isLoading ? (
                        <span className="animate-pulse">Verifying...</span>
                    ) : (
                        <>
                            {isLogin ? 'Login' : 'Sign Up'} 
                            <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={toggleMode}
                        className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Lock size={12} />
            <span>Secure Email Authentication</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;