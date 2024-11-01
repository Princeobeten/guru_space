"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { LogOut, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Cookies from 'js-cookie';
import TermsDialog from './TermsDialog';

const TopNav = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false); 

  const handleLogout = async () => {
    if (isLoggingOut) return; 

    try {
      setIsLoggingOut(true);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear the auth token from cookies
      Cookies.remove('authToken');
      
      // Clear any other auth-related cookies or local storage if they exist
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Redirect to login page
      router.push('/login');
      
      // Force a page refresh to clear any cached auth state
      router.refresh();

    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 h-14 w-full z-50 bg-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 mt-2 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-2xl font-bold hover:opacity-80 transition-opacity"
        >
          <motion.span
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Guru Space
          </motion.span>
        </Link>

        {/* Icons Section */}
        <div className="flex items-center justify-center space-x-2">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            {/* Help Icon */}
            <button
              onClick={() => setIsTermsDialogOpen(true)} // Open the TermsDialog on click
              className="p-2 hover:bg-navy-light rounded-full transition-colors duration-200 relative"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </motion.div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 ${
              isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:block text-xs">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Terms and Conditions Dialog */}
      <TermsDialog 
        isOpen={isTermsDialogOpen} 
        onOpenChange={setIsTermsDialogOpen} 
      />
    </nav>
  );
};

export default TopNav;