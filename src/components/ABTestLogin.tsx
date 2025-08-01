import { useState, useEffect } from 'react';
import Login from '../views/Login';
import LoginV2 from '../views/LoginV2';
import { abTestAnalytics } from './ABTestAnalytics';

export default function ABTestLogin() {
  const [showVariant, setShowVariant] = useState<'original' | 'v2' | null>(null);

  useEffect(() => {
    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem('loginVariant') as 'original' | 'v2' | null;
    
    if (storedVariant) {
      setShowVariant(storedVariant);
      abTestAnalytics.trackView(storedVariant);
    } else {
      // Simple A/B test: 50/50 split
      const variant = Math.random() < 0.5 ? 'original' : 'v2';
      setShowVariant(variant);
      
      // Store the variant in localStorage for consistency during the session
      localStorage.setItem('loginVariant', variant);
      abTestAnalytics.trackView(variant);
    }
  }, []);

  // Show loading state while determining variant
  if (showVariant === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF0DAF] via-[#F7D0ED] to-[#FF0DAF]">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF0DAF] mx-auto"></div>
        </div>
      </div>
    );
  }

  // Return the appropriate variant
  return showVariant === 'original' ? <Login /> : <LoginV2 />;
} 