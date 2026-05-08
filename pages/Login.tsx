
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const LogoIcon = () => (
  <div className="w-16 h-16 bg-white border-2 border-emerald-900 rounded-[1.5rem] flex items-center justify-center relative transform rotate-12 mx-auto shadow-sm">
     <i className="fi fi-rr-star text-emerald-900 text-2xl -rotate-12 translate-y-[-1px]"></i>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<'email' | 'mobile'>('email');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simulate a brief delay for UX authenticity
    setTimeout(() => {
      setIsLoading(false);
      onLogin("Ammar Ahmed");
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin("Ahmed Khan");
    }, 1000);
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute opacity-[0.03] pointer-events-none scale-[3] rotate-12">
        <LogoIcon />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center z-10">
        <div className="mb-4">
          <LogoIcon />
        </div>
        <h2 className="text-emerald-dark text-xl font-bold mb-1">KithAdemics</h2>
        
        <h1 className="text-2xl font-bold text-slate-800 mt-8 mb-2">Student Login</h1>
        <p className="text-slate-400 text-xs text-center mb-8 max-w-[200px]">
          Welcome back! Please choose a login method to continue.
        </p>

        <div className="w-full space-y-3">
          {/* Social Logins */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <i className="fi fi-brands-google mr-3"></i>
            {isLoading ? "Authenticating..." : "Continue with Google"}
          </button>

          <div className="flex items-center py-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="px-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <div className="flex bg-slate-50/50 p-1 rounded-2xl mb-4">
            <button 
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${method === 'email' ? 'bg-white shadow-sm text-emerald-800' : 'text-slate-400'}`}
            >
              Email
            </button>
            <button 
              onClick={() => setMethod('mobile')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${method === 'mobile' ? 'bg-white shadow-sm text-emerald-800' : 'text-slate-400'}`}
            >
              Mobile
            </button>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {method === 'email' ? (
              <>
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  required
                />
              </>
            ) : (
              <div className="flex space-x-2">
                <div className="w-24 px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 text-center text-sm font-medium">
                  +44
                </div>
                <input 
                  type="tel" 
                  placeholder="Mobile Number"
                  className="flex-1 px-5 py-4 rounded-2xl bg-white border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  required
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-dark hover:bg-emerald-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center shadow-lg shadow-emerald-950/20"
            >
              {isLoading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </div>

        <button className="mt-8 text-xs font-medium text-slate-400 hover:text-emerald-800 transition-colors">
          Don't have an account? <span className="text-emerald-700 font-bold">Sign Up</span>
        </button>
      </div>
    </div>
  );
};

export default Login;
