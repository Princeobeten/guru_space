'use client';

import '../../globals.css';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import Toaster from '@/components/Toaster';
import Link from 'next/link';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showToaster, setShowToaster] = useState<boolean>(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowToaster(false);
  
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowToaster(true);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No user found with this email.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
      setShowToaster(true);
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-navy to-blue-900 px-4 md:px-0">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        <form onSubmit={handleForgotPassword} className="space-y-4">
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
          <button
            type="submit"
            className="w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-blue-900 transition"
          >
            Send Reset Email
          </button>

          <div className="mt-4 sm:mt-6 text-center text-sm sm:text-base">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-navy hover:underline font-medium">
            Login
          </Link>
        </div>
        </form>

        <Toaster
          message={error || success}
          type={error ? 'error' : 'success'}
          isVisible={showToaster}
          onClose={() => setShowToaster(false)}
        />
      </div>
    </div>
  );
};

export default ForgotPassword;