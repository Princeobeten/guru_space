"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Bell, LogOut, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from 'js-cookie';

const TopNav = () => {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // Sample notifications - replace with real data
  const notifications = [
    { id: 1, message: "New booking request", time: "5m ago" },
    { id: 2, message: "Payment received", time: "1h ago" },
    { id: 3, message: "New review posted", time: "2h ago" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-navy text-white shadow-lg">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
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
        <div className="flex items-center space-x-6">
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            <button
              onClick={() => {}}
              className="p-2 hover:bg-navy-light rounded-full transition-colors duration-200 relative"
            >
              <HelpCircle className="h-6 w-6" />
            </button>

            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 hover:bg-navy-light rounded-full transition-colors duration-200 relative"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-4 bg-navy-light border-b border-gray-700">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-gray-700 hover:bg-navy-light cursor-pointer transition-colors duration-200"
                      >
                        <p className="text-white text-sm">
                          {notification.message}
                        </p>
                        <span className="text-gray-400 text-xs">
                          {notification.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            <LogOut className="h-6 w-6" />
            <span className="hidden md:block">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;