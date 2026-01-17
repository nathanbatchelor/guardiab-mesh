'use client';

import { useEffect, useState } from 'react';

interface AlertBannerProps {
  isScam: boolean;
}

export default function AlertBanner({ isScam }: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isScam) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isScam]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-lg shadow-red-500/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">⚠️</div>
            <div>
              <h2 className="text-xl font-bold text-white">SCAM ALERT DETECTED</h2>
              <p className="text-red-100 text-sm">Guardian AI has detected suspicious activity.</p>
            </div>
          </div>
          <button onClick={() => setIsAnimating(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">✕</button>
        </div>
      </div>
    </div>
  );
}
