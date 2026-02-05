import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Loader } from '../components/shared/Loader';
import { investorAuthService } from '../services/investorAuthService';

const InvestorLoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  // Pre-fill email from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    if (investorAuthService.hasActiveSession()) {
      navigate('/investor/dataroom');
    }
  }, [navigate]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await investorAuthService.requestVerificationCode(email);
      setCodeSent(true);
      setSuccess('Verification code sent to your email');
      setStep('code');
    } catch (err: any) {
      const msg = err.message || 'Failed to send verification code';
      if (msg.includes('No documents have been shared') || msg.includes('No account found')) {
        setError(
          msg.includes('No account found')
            ? 'No encontramos una cuenta con este correo. Verifica el email o contacta a quien te invitó al Data Room.'
            : 'Aún no hay documentos compartidos con este correo. Recibirás un email con el código cuando te compartan documentos.'
        );
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (code.length !== 6) {
      setError('Code must be 6 digits');
      setIsLoading(false);
      return;
    }

    try {
      await investorAuthService.verifyCode(email, code);
      navigate('/investor/dataroom');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setCode('');

    try {
      await investorAuthService.requestVerificationCode(email);
      setSuccess('New verification code sent to your email');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">InvestiaFlow</h1>
          <p className="text-gray-600">Investor Data Room Access</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enter the email address where you received the document sharing notification
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Send Verification Code
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                    setError(null);
                  }}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={code.length !== 6}
            >
              Verify & Access Data Room
              <ArrowRight size={18} className="ml-2" />
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400"
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setError(null);
                  setSuccess(null);
                  setCodeSent(false);
                }}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-700 disabled:text-gray-400"
              >
                ← Change email address
              </button>
            </div>
          </form>
        )}

        {!import.meta.env.VITE_FIREBASE_API_KEY && (
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              ℹ️ Mock Mode: Firebase not configured. Verification codes will be logged to console.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorLoginPage;
