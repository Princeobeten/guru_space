'use client';

import Link from "next/link";
import { useState } from "react";
import { db } from '@/lib/firebase';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return email.match(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    );
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");

    if (!validateEmail(email)) {
      setStatus("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Check if email already exists
      const emailQuery = query(
        collection(db, "Newsletter"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(emailQuery);

      if (!querySnapshot.empty) {
        setStatus("This email is already subscribed!");
        setIsLoading(false);
        return;
      }

      // Add new subscriber
      await addDoc(collection(db, "Newsletter"), {
        email: email,
        subscribedAt: new Date().toISOString(),
      });

      setStatus("Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      setStatus("An error occurred. Please try again later.");
    }

    setIsLoading(false);
  };

  return (
    <footer className="bg-navy text-white">
      {/* Newsletter Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-white/80 mb-6">
              Stay updated with our latest spaces and exclusive offers.
            </p>
          </div>
          
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md text-navy focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-navy px-6 py-2 rounded-md font-medium hover:bg-white/90 transition-colors disabled:opacity-70"
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </button>
              </div>
              {status && (
                <p className={`text-sm ${
                  status.includes("error") || status.includes("already")
                    ? "text-red-400"
                    : "text-green-400"
                }`}>
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-center text-white/80">
            &copy; {new Date().getFullYear()} Guru Space. All rights reserved. | 
            Powered and Developed by {" "}
            <Link href="#" className="text-white hover:text-white/80">
              Guru Devs.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;