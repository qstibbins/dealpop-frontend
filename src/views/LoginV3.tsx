import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { abTestAnalytics } from '../components/ABTestAnalytics';

export default function LoginV2() {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithGoogle, signInWithEmail, createAccountWithEmail } = useAuth();
  const navigate = useNavigate();

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
      isLogin
        ? abTestAnalytics.trackLogin('v2')
        : abTestAnalytics.trackSignup('v2');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#E8F4FD] flex items-center justify-center p-8">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex">
          {/* Left Panel */}
          <div className="w-1/2 flex items-center justify-center px-16 py-8">
            <div className="max-w-md w-full">
              <h1 className="text-4xl font-bold text-black mb-2">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h1>
              <p className="text-black text-base mb-6">
                {isLogin
                  ? 'Welcome back to Deal pop'
                  : 'Welcome to Deal pop, join us if you want to track your savings'}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                      placeholder="Enter your name"
                    />
                  </div>
                )}

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                    placeholder="Enter your email"
                  />
                </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                    placeholder="Enter your password"
                  />
                </div>

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
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300"
                      placeholder="Confirm your password"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pink-200 hover:bg-pink-300 text-black font-semibold py-3 px-6 rounded-md border border-pink-300 shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Sign up'
                  )}
                </button>
              </form>

              <div className="mt-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-[#E6F1F5] text-sm font-medium text-black hover:bg-[#d5e8ef] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

              <p className="mt-6 text-sm text-black text-center">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setName('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-pink-600 underline hover:text-pink-800 transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 bg-[#FFD700] relative rounded-tr-2xl rounded-br-2xl overflow-hidden">
            <div className="absolute top-8 left-8 text-white z-10">
              <h2 className="text-3xl font-bold mb-2">DealPop</h2>
              <p className="text-sm font-medium tracking-wider uppercase">NAME IT, CLAIM IT</p>
            </div>

            <img
              src="/login.svg"
              alt="DealPop Login"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute right-0 top-0 h-full flex flex-col z-10">
              <div className="w-8 h-1/2 bg-teal-400"></div>
              <div className="w-8 h-1/2 bg-green-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold transform -rotate-90">Fi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
