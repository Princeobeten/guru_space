'use client';

import '../../globals.css';
import { useState, Suspense } from 'react';
import { signInWithEmailAndPassword, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import Toaster from '@/components/Toaster';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Moved to the top level
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'; // Defined at the top level

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowToaster(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(userCredential.user);

      // Set the token in cookies with appropriate options
      Cookies.set('authToken', token, {
        expires: 7, // 7 days
        secure: true,
        sameSite: 'strict',
      });

      setSuccess('Login successful! Redirecting...');
      setShowToaster(true);

      setTimeout(() => {
        router.push(callbackUrl); // Use the callbackUrl from the top level
      }, 1000);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
      setShowToaster(true);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-navy to-blue-900 px-4 md:px-0">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-md focus:ring-navy focus:border-navy"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-900 focus:border-navy"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-blue-900 transition"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-navy hover:underline">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <span className="text-gray-600">Don’t have an account? </span>
            <Link href="/sign-up" className="text-navy hover:underline">
              Sign up
            </Link>
          </div>

          <Toaster
            message={error || success}
            type={error ? 'error' : 'success'}
            isVisible={showToaster}
            onClose={() => setShowToaster(false)}
          />
        </div>
      </div>
    </Suspense>
  );
};

export default Login;
