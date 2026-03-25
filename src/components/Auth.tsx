import { useState } from "react";
import { 
  Facebook, 
  Mail, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare
} from "lucide-react";
import { motion } from "motion/react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "sonner";

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome to Messenger CRM");
    } catch (e: any) {
      toast.error(e.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex flex-1 relative bg-zinc-900 border-r border-zinc-800 flex-col p-16 justify-between">
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <MessageSquare size={24} className="text-zinc-900" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight italic serif">Messenger CRM</h1>
          </div>
          <p className="text-zinc-500 max-w-sm leading-relaxed">
            The most compliant and powerful CRM for Facebook Fanpage management.
          </p>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <h2 className="text-6xl font-bold tracking-tighter leading-none">
              Manage <br /> 
              <span className="text-zinc-500">Conversations</span> <br />
              With Precision.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck size={18} />
                <span className="text-xs font-mono uppercase tracking-widest">Compliant</span>
              </div>
              <p className="text-sm text-zinc-500">Strict adherence to Meta's 24h window policy.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Zap size={18} />
                <span className="text-xs font-mono uppercase tracking-widest">Real-time</span>
              </div>
              <p className="text-sm text-zinc-500">Instant message sync and broadcast delivery.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono text-zinc-600 uppercase tracking-widest">
          &copy; 2026 Messenger Fanpage CRM. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tight italic serif">Sign In</h3>
            <p className="text-zinc-500">Access your dashboard and manage your fanpage.</p>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-4 py-4 bg-white text-zinc-900 rounded-2xl font-bold hover:bg-zinc-100 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-zinc-900"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs font-mono uppercase tracking-widest">
                <span className="bg-zinc-950 px-4 text-zinc-600">Or use email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>
              <button className="w-full flex items-center justify-center space-x-2 py-4 bg-zinc-800 text-zinc-400 rounded-2xl font-bold hover:bg-zinc-700 hover:text-white transition-all">
                <span>Sign In</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-900 flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-zinc-600">
              <Facebook size={14} />
              <p className="text-[10px] font-mono uppercase tracking-widest">Official Meta Partner</p>
            </div>
            <p className="text-xs text-zinc-600 text-center max-w-xs leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
