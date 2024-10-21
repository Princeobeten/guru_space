'use client';

import "../../globals.css";
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';
import Toaster from '@/components/Toaster';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { validateUserData, createUserDocument, CreateUserInput } from '@/schemas/user.schema';

const SignUp = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showToaster, setShowToaster] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowToaster(false);

    // Create user input for validation and storage
    const userInput: CreateUserInput = { firstName, lastName, email, phone };

    // Validate form data
    const validationError = validateUserData(userInput);
    if (validationError) {
      setError(validationError);
      setShowToaster(true);
      return;
    }

    try {
      // Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create Firestore document
      const userDocument = createUserDocument(userInput);
      const userCollectionRef = collection(db, 'Users'); // Firestore 'Users' collection
      await addDoc(userCollectionRef, {
        ...userDocument,
        uid: user.uid, 
      });

      setSuccess('Registration successful! Redirecting...');
      setShowToaster(true);

      setTimeout(() => {
        router.push('/login');
      }, 2000); 
    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('The email address is already in use by another account.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak. Please enter a stronger password.');
          break;
        default:
          setError('Failed to register. Please try again.');
      }
      setShowToaster(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-navy to-blue-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-md mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Sign Up</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm sm:text-base text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:ring-2 "
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm sm:text-base text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:ring-2 "
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm sm:text-base text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:ring-2 "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="Enter phone number"
              pattern="[0-9]{11}"
              title="Please enter a valid 11-digit phone number"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm sm:text-base text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:ring-2 "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm sm:text-base text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-md focus:ring-2  pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-navy text-white py-2 px-4 rounded-md hover:bg-blue-900 transition text-sm sm:text-base font-medium mt-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center text-sm sm:text-base">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-navy hover:underline font-medium">
            Login
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
  );
};

export default SignUp;