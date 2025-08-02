import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { abTestAnalytics } from '../components/ABTestAnalytics';

export default function LoginV2() {
  const [isLogin, setIsLogin] = useState(false); // Default to sign up for this variant
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithGoogle, signInWithEmail, createAccountWithEmail } = useAuth();
  const navigate = useNavigate();

  // Track view for analytics
  useEffect(() => {
    abTestAnalytics.trackView('v2');
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    abTestAnalytics.trackGoogleSignup('v2');
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6 && !isLogin) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = isLogin 
      ? await signInWithEmail(email, password)
      : await createAccountWithEmail(email, password);

    if (result.error) {
      setError(result.error);
    } else {
      if (isLogin) {
        abTestAnalytics.trackLogin('v2');
      } else {
        abTestAnalytics.trackSignup('v2');
      }
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#E8F4FD]">
      {/* Left Section - Login Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Title */}
          <h1 className="text-4xl font-bold text-black mb-2">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </h1>
          
          {/* Subtitle */}
          <p className="text-black text-base mb-8">
            {isLogin 
              ? 'Welcome back to Deal pop'
              : 'Welcome to Deal pop, join us if you want to track your savings'
            }
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            {/* Name Field */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                  Name*
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  placeholder="Enter your name"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email*
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password*
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password Field */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                  Confirm Password*
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* Sign Up/In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFB6C1] hover:bg-[#FFA0B0] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Sign up'
              )}
            </button>
          </form>

          {/* Google Sign Up/In Button */}
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-black hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </button>
          </div>

          {/* Login/Signup Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-[#FF69B4] hover:text-[#FF1493] font-semibold text-sm transition-colors duration-200"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log In'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Login.svg Image */}
      <div className="flex-1 bg-[#FFD700] relative overflow-hidden flex items-center justify-center">
        {/* Display the login.svg image */}
        <img 
          src="/login.svg" 
          alt="DealPop Login" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
} 