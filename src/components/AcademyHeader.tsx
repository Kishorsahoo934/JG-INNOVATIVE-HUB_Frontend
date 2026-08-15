import { Link } from 'react-router-dom';
import { User, ArrowRight, LayoutDashboard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import LogoMark from '@/components/LogoMark';

const AcademyHeader = () => {
  const { user, isAuthenticated } = useAuth();

  // Render Tutor action button dynamically
  const renderTutorButton = () => {
    if (isAuthenticated && user) {
      if (user.role === 'tutor') {
        return (
          <Link to="/tutor-dashboard">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-full border-primary/50 text-primary hover:bg-primary/10 text-xs sm:text-sm">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tutor Dashboard</span>
            </Button>
          </Link>
        );
      }
      if (user.tutorStatus === 'pending') {
        return (
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-full text-xs sm:text-sm text-yellow-500/80 hover:text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10 cursor-default" disabled>
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Pending Application</span>
          </Button>
        );
      }
    }

    return (
      <Link to={isAuthenticated ? "/tutor-registration" : "/login?redirect=/tutor-registration"}>
        <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-full">
          <span>Become a Tutor</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0d1520]/95 backdrop-blur-sm border-b border-white/10 shadow-sm text-white">
      <div className="container mx-auto px-4">
        {/* Header grid: responsive layout */}
        <div className="flex items-center justify-between py-3 h-20 gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <LogoMark variant="navDark" priority />
              <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                Innovative <span className="text-primary">Hub</span>
              </span>
            </Link>
            
            {/* Section label for Academy */}
            <span className="hidden sm:inline-block px-2.5 py-0.5 border border-primary/20 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
              Academy
            </span>
          </div>

          {/* Actions on right */}
          <div className="flex items-center gap-3 shrink-0">
            {renderTutorButton()}

            <Link to="/account">
              <Button variant="default" size="sm" className="gap-1.5 rounded-full px-4 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-white font-medium">
                <User className="w-3.5 h-3.5" />
                <span>My Account</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AcademyHeader;
