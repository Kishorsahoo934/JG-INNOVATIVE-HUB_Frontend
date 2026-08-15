import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, ExternalLink, Youtube, MessageCircle } from 'lucide-react';
import { visitorsApi } from '../services/api';

const Footer = () => {
  const [visitorCount, setVisitorCount] = useState(153245); // default fallback matching baseline

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const visited = sessionStorage.getItem('platform_visited');
        let res;
        if (!visited) {
          res = await visitorsApi.hit();
          sessionStorage.setItem('platform_visited', 'true');
        } else {
          res = await visitorsApi.get();
        }
        if (res.success && res.data) {
          setVisitorCount(res.data.count);
        }
      } catch (err) {
        console.error('Failed to sync visitor count:', err);
      }
    };

    fetchVisitors();

    const interval = setInterval(async () => {
      try {
        const res = await visitorsApi.get();
        if (res.success && res.data) {
          setVisitorCount(res.data.count);
        }
      } catch (err) {
        // Silent error
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/eshop' },
    { name: 'Workshops', path: '/workshops' },
    { name: 'Internships', path: '/internships' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Gallery', path: '/gallery' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms-conditions' },
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/jginnovativehub' },
    { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/share/18CKz7ZSqC/' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/company/jg-innovative-hub-pvt-ltd/' },
    { name: 'YouTube', icon: Youtube, url: '#' },
    { name: 'WhatsApp', icon: MessageCircle, url: 'https://whatsapp.com/channel/0029Vb8GAtt1NCrPKRvlKr2p' },
  ];

  return (
    <footer className="bg-footer border-t border-border/40 text-footer-text">
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {/* Column 1: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-footer-muted hover:text-white hover:translate-x-1 transition-all duration-200 inline-block py-1 touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-footer-muted hover:text-white hover:translate-x-1 transition-all duration-200 inline-block py-1 touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-footer-muted hover:text-white hover:translate-x-1 transition-all duration-200 inline-block py-1 touch-manipulation"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Links / Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">JG Innovative Hub</h4>
            <p className="text-sm text-footer-muted leading-relaxed mb-6">
              JG Innovative Hub Pvt. Ltd. is an innovation-driven technology and product engineering company. We bridge the gap between concept and implementation by creating solutions for a smarter, more connected, and sustainable future.
            </p>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">Follow Us</h4>
            <div className="flex flex-wrap gap-3.5 mt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 flex items-center justify-center text-footer-muted hover:text-white transition-all group touch-manipulation"
                  title={social.name}
                >
                  <social.icon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-200" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-footer-muted text-center sm:text-left">
            © {new Date().getFullYear()} JG Innovative Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-footer-muted">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Platform Visitors: <strong className="text-white font-mono">{visitorCount.toLocaleString()}</strong></span>
          </div>
          <p className="text-xs text-footer-muted/60 text-center sm:text-right">
            Providing tools, knowledge, and community to transform ideas into reality.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
