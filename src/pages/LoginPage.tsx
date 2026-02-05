import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Mail, Lock, Chrome } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get theme (may not be available if user not logged in, but ThemeProvider wraps App)
  const { logoUrl, companyName } = useTheme();
  
  // Get redirect URL and email hint from query params
  const redirectTo = searchParams.get('redirect') || '/';
  const emailHint = searchParams.get('email');
  
  // Pre-fill email if provided in URL (e.g., from invitation)
  useEffect(() => {
    if (emailHint && !email) {
      setEmail(emailHint);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailHint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        await signup(email, password, name);
      }
      // Navigate to redirect URL or default to dashboard
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      // Navigate to redirect URL or default to dashboard
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={`${companyName} logo`}
              className="h-16 w-16 mx-auto mb-4 object-contain"
            />
          ) : (
            <div className="h-16 w-16 mx-auto mb-4 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {companyName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyName}</h1>
          <p className="text-gray-600">Fundraising CRM</p>
          {redirectTo.includes('/invite/') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {emailHint 
                  ? `You've been invited to join a team. Please ${isLogin ? 'login' : 'sign up'} with ${emailHint}`
                  : "You've been invited to join a team. Please login or sign up to accept the invitation."
                }
              </p>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              placeholder="Your name"
            />
          )}
          
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="sebas@investia.capital"
          />
          
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            minLength={6}
          />
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full mt-4"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Chrome size={18} className="mr-2" />
            Google
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Login"}
          </button>
        </div>

        {!import.meta.env.VITE_FIREBASE_API_KEY && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              ℹ️ Mock Mode: Firebase not configured. Login works with any credentials.
            </p>
            <p className="text-xs text-blue-600 text-center mt-1">
              Configure Firebase in .env.local to enable real authentication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
