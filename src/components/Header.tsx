import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LogoMark from '@/components/LogoMark';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Workshop', path: '/workshops' },
    { name: 'Internship', path: '/internships' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0d1520]/95 backdrop-blur-sm border-b border-white/10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 min-h-[3.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
            <LogoMark variant="navDark" priority />
            <span className="text-lg md:text-xl font-bold text-white tracking-tight">
              JG Innovative <span className="text-white">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? 'text-primary' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/account">
              <Button variant="default" size="sm" className="gap-2 rounded-full px-5">
                <User className="w-4 h-4" />
                My Account
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button - larger touch target */}
          <button
            className="lg:hidden p-3 -mr-2 text-white hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`px-4 py-3.5 min-h-[44px] flex items-center rounded-lg text-base font-medium transition-colors touch-manipulation ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-white/10 my-2" />
              <Link
                to="/account"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 px-4 py-3.5 min-h-[44px] text-base font-medium text-gray-300 hover:bg-white/10 hover:text-white rounded-lg touch-manipulation"
              >
                <User className="w-4 h-4" />
                My Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
