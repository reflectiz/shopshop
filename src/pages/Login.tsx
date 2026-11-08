import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFlavor, useFlavorPath } from '../flavors/FlavorContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const flavor = useFlavor();
  const flavorPath = useFlavorPath();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!flavor.clean) {
      const w = window as unknown as {
        dataLayer?: Record<string, unknown>[];
        ttq?: Record<string, (...args: unknown[]) => void>;
      };
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: 'login', user_data: { email_address: email } });
      w.ttq?.identify?.({ email });
      w.ttq?.track?.('Login', { email });
    }

    const result = await login(email, password);
    
    if (result.success) {
      navigate(flavorPath());
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <p id="login-brand" className="text-center text-sm font-semibold uppercase tracking-wide text-brand">
            {flavor.brandName}
          </p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email-login-input"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password-login-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand focus:border-brand focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-brand hover:text-brand-hover">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Demo credentials, so a salesperson never has to remember them mid-call. */}
          <div id="login-demo-credentials" className="rounded-md bg-brand-subtle px-4 py-3 text-center text-xs text-gray-600">
            <span className="font-semibold text-gray-700">Demo login</span>
            <span className="mx-1.5">·</span>
            <button
              type="button"
              id="login-demo-credentials-fill"
              onClick={() => {
                setEmail(flavor.demoCredentials.email);
                setPassword(flavor.demoCredentials.password);
              }}
              className="font-medium text-brand hover:underline"
            >
              {flavor.demoCredentials.email} / {flavor.demoCredentials.password}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

