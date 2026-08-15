import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authApi, setAuthToken } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import LogoMark from '@/components/LogoMark';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token') || '';
  const returnTo = searchParams.get('returnTo') || '/account';

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please use the link from your email.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.verifyEmail(token);
        if (cancelled) return;
        if (res.success && res.data) {
          const d = res.data as { token: string; user: unknown };
          if (d.token) {
            setAuthToken(d.token);
            await refreshUser();
          }
          setStatus('success');
          toast({ title: 'Email verified', description: 'Your account is active. Welcome!' });
          const path = returnTo.startsWith('/') ? returnTo : `/${returnTo}`;
          navigate(path);
        } else {
          setStatus('error');
          setMessage((res as { message?: string }).message || 'Verification failed.');
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Invalid or expired verification link.');
      }
    })();

    return () => { cancelled = true; };
  }, [token, returnTo, navigate, toast, refreshUser]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex items-center justify-center p-4 sm:p-6">
      <SEO title="Verify Email" description="Verify your Innovative Hub account." path="/verify-email" noIndex />
      <div className="w-full max-w-md text-center">
        <Link to="/" className="mb-6 mx-auto block w-fit">
          <LogoMark variant="auth" />
        </Link>
        {status === 'pending' && (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Verifying your email...</h1>
            <p className="text-muted-foreground mt-2">Please wait.</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Verification failed</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
            <Button asChild className="mt-6">
              <Link to="/login">Go to login</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
