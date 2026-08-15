import { useEffect, useState } from 'react';
import LogoMark from '@/components/LogoMark';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  // ⏱️ LOADING DURATION: Change this value (in milliseconds) to adjust loading time
  // 2000 = 2 seconds, 3000 = 3 seconds, etc.
  const LOADING_DURATION = 2000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onLoadingComplete, 300); // Fade out transition
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />

        {/* Animated glow circles - responsive sizes */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-primary/6 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
      </div>

      {/* Centered Logo Container - no circular clip so the mark keeps the full glyph */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <div className="animate-fade-scale-in" style={{ animationDelay: '0s' }}>
          <div className="relative">
            <div className="absolute inset-0 -m-8 bg-primary/20 blur-3xl rounded-full scale-110 animate-logo-glow" />
            <div className="relative animate-logo-pulse">
              <LogoMark variant="loading" priority />
            </div>
          </div>
        </div>

        <h1 className="mt-4 sm:mt-5 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          Innovative Hub
        </h1>

        <div className="mt-4 sm:mt-6 flex items-center gap-1 sm:gap-1.5">
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
