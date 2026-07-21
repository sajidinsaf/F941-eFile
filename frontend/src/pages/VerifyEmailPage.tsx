import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import { authService } from '@/services/authService';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Your email has been verified successfully!');
      } catch {
        setStatus('error');
        setMessage('Failed to verify email. The link may have expired or is invalid.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <AuthLayout title="Email Verification">
      <div className="text-center py-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Verifying your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Verified!</h3>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="btn-primary">
              Continue to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="btn-primary">
              Go to Sign In
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
