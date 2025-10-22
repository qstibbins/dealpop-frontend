import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DealPopLogo from '/img/DealPop_full_logo.png';

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
      
      console.log('🔍 Login useEffect - user authenticated, isExtensionAuth:', isExtensionAuth);
      
      if (isExtensionAuth) {
        console.log('🔍 Extension auth detected - staying on login page to handle auth flow');
        // Don't redirect - let the AuthContext handle sending auth to extension
        // The extension auth UI will be shown by the render logic below
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
      <div className="fixed inset-0 w-full h-full flex overflow-x-hidden">
        {/* Left Section - Loading */}
        <div className="flex-1 bg-[#3A8EDF] flex items-center justify-center px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A8EDF] mx-auto"></div>
          </div>
        </div>

        {/* Right Section - Logo */}
        <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
            <div className="text-center">
              <img 
                src={DealPopLogo} 
                alt="DealPop" 
                className="h-96 w-auto mx-auto"
              />
          </div>
        </div>
      </div>
    );
  }

  // Check if this is extension auth and user is already logged in
  const urlParams = new URLSearchParams(window.location.search);
  const isExtensionAuth = urlParams.get('extension') === 'true';
  
  console.log('🔍 Login render - URL:', window.location.href);
  console.log('🔍 Login render - search params:', window.location.search);
  console.log('🔍 Login render - isExtensionAuth:', isExtensionAuth);
  console.log('🔍 Login render - user:', !!user);
  console.log('🔍 Login render - authLoading:', authLoading);
  
  if (isExtensionAuth && user && !authLoading) {
    console.log('🔍 Showing extension auth screen');
    return (
      <div className="fixed inset-0 w-full h-full flex overflow-x-hidden">
        {/* Left Section - Auth Status */}
        <div className="flex-1 bg-[#3A8EDF] flex items-center justify-center px-8 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-[#E94E77] leading-tight">
                Name it.<br />
                Claim it.
              </h1>
            </div>
            
            {!showCompleteMessage ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A8EDF] mx-auto mb-4"></div>
                <h2 className="text-lg font-semibold text-[#1D1D1D] mb-2">
                  Connecting to Extension...
                </h2>
                <p className="text-[#808080] text-sm">
                  Authenticating your browser extension.
                </p>
              </>
            ) : (
              <>
                <div className="text-[#3CB371] mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#1D1D1D] mb-2">
                  Authentication Complete!
                </h2>
                <p className="text-[#808080] text-sm mb-4">
                  Your extension has been authenticated successfully.
                </p>
                <p className="text-[#808080] text-xs">
                  You can now close this tab and return to the extension.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Section - Logo */}
        <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
          <div className="text-center">
            <img 
              src={DealPopLogo} 
              alt="DealPop" 
              className="h-96 w-auto mx-auto"
            />
          </div>
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
    <div className="fixed inset-0 w-full h-full flex overflow-x-hidden">
      {/* Left Section - Login Form */}
      <div className="flex-1 bg-[#3A8EDF] flex items-center justify-center px-8 py-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          {/* Headline */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#E94E77] leading-tight">
              Name it.<br />
              Claim it.
            </h1>
          </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl bg-white text-sm font-medium text-[#808080] hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Separator */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#808080] font-medium">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-[#808080]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-[#808080]"
                placeholder="Enter your password"
              />
            </div>

            {!isLogin && (
              <div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-[#808080]"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#3CB371] hover:bg-[#2E8B57] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3CB371] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-[#3CB371] hover:text-[#2E8B57] font-semibold text-sm transition-colors duration-200"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Section - Logo */}
      <div className="flex-1 bg-white flex items-center justify-center px-8 py-12">
        <div className="text-center">
          <img 
            src={DealPopLogo} 
            alt="DealPop" 
            className="h-96 w-auto mx-auto"
          />
        </div>
      </div>
    </div>
  );
}