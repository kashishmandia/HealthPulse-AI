import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api'; // <--- FIXED IMPORT
import { BeamsBackground } from '../components/ui/beams-background';
import { ShimmerButton } from '../components/ui/shimmer-button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Get the response data (which contains the token)
      const data = await apiClient.login(email, password);
      
      // 2. SAVE THE TOKEN (Crucial Step!)
      localStorage.setItem('token', data.token);
      
      // 3. (Optional) Save user info if needed for welcome message
      localStorage.setItem('user', JSON.stringify(data.user));

      // 4. Navigate
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    // 1. Wrap the entire page in the Beams Background
    <BeamsBackground intensity="strong">
      
      {/* 2. Glassmorphism Card Container */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 tracking-tight">
            HealthPulse AI
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Welcome back. Monitor your health intelligently.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-4">
            {/* 3. The Shimmer Button for submitting */}
            <ShimmerButton className="w-full shadow-lg" type="submit">
              <span className="text-center font-semibold tracking-wide text-white">
                Sign In
              </span>
            </ShimmerButton>
          </div>
        </form>

        <p className="text-center mt-8 text-sm text-gray-500">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-all"
          >
            Create Account
          </Link>
        </p>
      </div>
    </BeamsBackground>
  );
};

export default LoginPage;