import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, createAccountWithEmail } = useAuth();
  const navigate = useNavigate();
  const [showCompleteMessage, setShowCompleteMessage] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Check if this is an extension auth request
      const urlParams = new URLSearchParams(window.location.search);
      const isExtensionAuth = urlParams.get('extension') === 'true';
      
      if (isExtensionAuth) {
        console.log('🔍 Extension auth detected - staying on login page to handle auth flow');
        // Don't redirect - let the AuthContext handle sending auth to extension
      } else {
        console.log('🔍 User already authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Track view for analytics (removed A/B test analytics)
  useEffect(() => {
    console.log('📊 Login page viewed');
  }, []);

  // Handle extension auth completion message
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isExtensionAuth = urlParams.get('extension') === 'true';
    
    if (isExtensionAuth && user && !authLoading) {
      const timer = setTimeout(() => {
        setShowCompleteMessage(true);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [user, authLoading]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Check if this is extension auth and user is already logged in
  const urlParams = new URLSearchParams(window.location.search);
  const isExtensionAuth = urlParams.get('extension') === 'true';
  
  if (isExtensionAuth && user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 px-4 relative overflow-hidden">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 border border-white/20 text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              DealPop
            </h1>
          </div>
          
          {!showCompleteMessage ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-[#1D1D1D] mb-2">
                Connecting to Extension...
              </h2>
              <p className="text-[#828282] text-sm">
                Authenticating your browser extension.
              </p>
            </>
          ) : (
            <>
              <div className="text-green-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1D1D1D] mb-2">
                Authentication Complete!
              </h2>
              <p className="text-[#828282] text-sm mb-4">
                Your extension has been authenticated successfully.
              </p>
              <p className="text-[#828282] text-xs">
                You can now close this tab and return to the extension.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isExtensionAuth && !user && !authLoading) {
    console.log('🔍 Extension auth but no user - showing login form for fresh login');
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    console.log('📊 Google sign-in attempted');
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
        console.log('📊 Email login successful');
      } else {
        console.log('📊 Email signup successful');
      }
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF0DAF] via-[#F7D0ED] to-[#FF0DAF] px-4 py-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#2F80ED]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#27AE60]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-md w-full relative z-10 border border-white/20 mx-2 my-4 md:mx-4 md:my-6">
        {/* Logo and Brand Section */}
        <div className="text-center mb-4">
          <div className="mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF0DAF] to-[#2F80ED] bg-clip-text text-transparent mb-2">
              DealPop
            </h1>
            <p className="text-sm font-medium text-[#4F4F4F] tracking-wider uppercase">
              NAME IT, CLAIM IT
            </p>
          </div>
          <div className="mb-3">
            <p className="text-lg font-semibold text-[#1D1D1D] mb-1">
              Wish it. Watch it. Snag it.
            </p>
            <p className="text-[#828282] text-sm">
              Track prices. Save money. Get notified.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Social Login Button */}
        <div className="mb-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 border-2 border-[#E0E0E0] rounded-xl shadow-sm bg-white text-sm font-semibold text-[#333333] hover:bg-gray-50 hover:border-[#FF0DAF] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF0DAF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E0E0E0]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/95 text-[#828282] font-medium">or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#333333] mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF0DAF] focus:border-[#FF0DAF] transition-all duration-200 placeholder-[#BDBDBD]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#333333] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF0DAF] focus:border-[#FF0DAF] transition-all duration-200 placeholder-[#BDBDBD]"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#333333] mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF0DAF] focus:border-[#FF0DAF] transition-all duration-200 placeholder-[#BDBDBD]"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-[#FF0DAF] to-[#FF0DAF] hover:from-[#E60099] hover:to-[#E60099] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0DAF] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
            }}
            className="text-[#FF0DAF] hover:text-[#E60099] font-semibold text-sm transition-colors duration-200"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Brand Purpose */}
        <div className="mt-6 pt-4 border-t border-[#E0E0E0]">
          <div className="text-center">
            <p className="text-xs text-[#828282] leading-relaxed">
              To help mindful shoppers save time and money by tracking product prices, organizing wishlists, and getting notified when the deal is just right.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}