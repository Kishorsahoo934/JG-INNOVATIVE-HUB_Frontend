import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import LogoMark from '@/components/LogoMark';
import { authApi } from '@/services/api';
import { normalizeIndianMobile10, isValidIndianMobile10 } from '@/utils/phone';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          prompt: (notification?: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void;
          renderButton: (
            element: HTMLElement,
            options?: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: number;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
};

const getRedirectPath = (searchParams: URLSearchParams): string => {
  const r = searchParams.get('redirect');
  if (!r || !r.startsWith('/') || r.startsWith('//')) return '/account';
  return r;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, googleLogin, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerify, setShowResendVerify] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleRenderedRef = useRef(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
  });

  // Redirect if already authenticated (back to the page they came from)
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(getRedirectPath(searchParams), { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({ title: 'Welcome back!', description: 'You have logged in successfully.' });
        navigate(getRedirectPath(searchParams), { replace: true });
      } else {
        const m = normalizeIndianMobile10(formData.mobile);
        if (formData.mobile.trim()) {
          if (!isValidIndianMobile10(m)) {
            toast({
              title: 'Invalid mobile',
              description: 'Enter a correct 10-digit Indian mobile. Wrong numbers can affect delivery and refunds.',
              variant: 'destructive',
            });
            setIsLoading(false);
            return;
          }
        }
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          ...(m && formData.mobile.trim() ? { mobile: m } : {}),
        });
        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account. Click the button in the email to activate.',
        });
        setShowResendVerify(false);
      }
    } catch (error) {
      let message = 'Something went wrong';
      const errMsg = error instanceof Error ? error.message : '';
      if (errMsg.includes('Invalid credentials') || errMsg.includes('Invalid login')) {
        message = 'Invalid email or password';
      } else if (errMsg.includes('verify your email')) {
        message = errMsg;
        setShowResendVerify(true);
      } else if (errMsg.includes('already exists') || errMsg.includes('already registered')) {
        message = 'An account with this email already exists';
      } else if (errMsg.includes('Password should be')) {
        message = 'Password should be at least 6 characters';
      } else {
        message = errMsg || message;
      }
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerify = async () => {
    if (!formData.email.trim()) return;
    setIsResending(true);
    try {
      await authApi.resendVerifyEmail(formData.email.trim());
      toast({ title: 'Email sent', description: 'A new verification link was sent to your email.' });
      setShowResendVerify(false);
    } catch {
      toast({ title: 'Error', description: 'Could not send verification email. Try again.', variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (!googleButtonRef.current) return;
    if (googleRenderedRef.current) return;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      toast({
        title: 'Google login unavailable',
        description: 'Missing Google client ID configuration.',
        variant: 'destructive',
      });
      return;
    }
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res) => {
            setIsLoading(true);
            try {
              await googleLogin(res.credential);
              toast({ title: 'Welcome!', description: 'Signed in with Google successfully.' });
              navigate(getRedirectPath(searchParams), { replace: true });
            } catch (error) {
              toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to sign in with Google',
                variant: 'destructive',
              });
            } finally {
              setIsLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 360,
        });
        googleRenderedRef.current = true;
      })
      .catch(() => {
        toast({
          title: 'Google login unavailable',
          description: 'Failed to load Google Identity Services.',
          variant: 'destructive',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [googleLogin, navigate, toast, searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex items-center justify-center p-4 sm:p-6">
      <SEO title="Login" description="Sign in to your Innovative Hub account." path="/login" noIndex />
      <div className="w-full max-w-md">
        {/* Mobile-friendly back + shop escape (browser Back works after replace-safe redirects from Account/Checkout) */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 min-h-[44px] pl-2 pr-3 -ml-2 touch-manipulation shrink-0"
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          <Link
            to="/eshop"
            className="text-sm font-semibold text-primary min-h-[44px] inline-flex items-center touch-manipulation px-2 text-right truncate max-w-[55%]"
          >
            Continue shopping
          </Link>
        </div>

        {/* Logo — shop home so users stay in the store flow */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/eshop" className="mb-4 mx-auto block w-fit">
            <LogoMark variant="auth" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {isLogin ? 'Sign in to your account' : 'Join Innovative Hub today'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name - Only for Register */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground touch-manipulation"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              )}
              {isLogin && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  If you add a number, use the correct mobile you can be reached on. Wrong numbers may delay or cancel delivery; paid amounts may be non-refundable per policy.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full min-h-[48px] touch-manipulation" disabled={isLoading}>
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Resend verification (shown when login failed due to unverified email) */}
            {showResendVerify && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-[44px] touch-manipulation"
                  disabled={isResending}
                  onClick={handleResendVerify}
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </Button>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Login - fit inside mobile viewport, no horizontal overflow */}
          <div className="w-full flex justify-center min-w-0 max-w-full">
            <div ref={googleButtonRef} className="w-full max-w-sm min-w-0 max-w-full overflow-hidden" />
          </div>

          {/* Toggle Login/Register */}
          <p className="text-center mt-6 text-sm text-muted-foreground py-2">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary hover:underline font-medium touch-manipulation min-h-[44px] inline-flex items-center"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground min-h-[44px] inline-flex items-center touch-manipulation">
            Marketing site
          </Link>
          <Link to="/eshop" className="hover:text-foreground min-h-[44px] inline-flex items-center touch-manipulation">
            E-Shop home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
