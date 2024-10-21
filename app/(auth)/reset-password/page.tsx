"use client";

import { useState, useEffect } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ResetPassword = () => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [oobCode, setOobCode] = useState<string | null>(null);

  // On mount, get oobCode (action code) from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOobCode(params.get('oobCode'));
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (oobCode) {
      try {
        await confirmPasswordReset(auth, oobCode, password);
        setSuccess('Password has been successfully reset. You can now log in with your new password.');
      } catch (err: any) {
        setError('Failed to reset password. The reset link may have expired or is invalid.');
      }
    } else {
      setError('Invalid password reset request.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-navy to-blue-900 px-4 md:px-0">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-gray-700">New Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-md focus:ring-navy focus:border-navy"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 border rounded-md focus:ring-navy focus:border-navy"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-blue-900 transition"
          >
            Reset Password
          </button>
        </form>

        {error && <div className="text-red-500 mt-4">{error}</div>}
        {success && <div className="text-green-500 mt-4">{success}</div>}
      </div>
    </div>
  );
};

export default ResetPassword;