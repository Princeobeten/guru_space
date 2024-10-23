"use client";

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white text-navy p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">
          Guru Space
        </Link>
        <div className="md:hidden">
          <button
            className="bg-transparent border-0 p-2"
            onClick={handleMenuToggle}
          >
            <Menu className='hover:text-navy/60 transition duration-300 transform hover:scale-105'/>
          </button>
        </div>
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden fixed top-0 left-0 w-full h-screen bg-gradient-to-br from-gray-200 to-gray-100 text-navy p-4 z-50`}
        >
          <button
            className="bg-transparent border-0 p-2 absolute top-4 right-4"
            onClick={handleMenuToggle}
          >
            <X className='hover:text-navy/60 transition duration-300 transform hover:scale-105'/>
          </button>
          <ul className="pt-12 text-center">
            <li>
            <Link
            className="inline-block mb-4 hover:font-bold"
            href="/contact"
          >
            Contact
          </Link>
            </li>

            <li>
            <Link
            href="/sign-up"
            className="inline-block text-navy border border-gray-300 font-medium text-md py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 mb-4"
          >
            Sign-up
          </Link>
            </li>
            
            <li>
            <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-blue-900 to-navy text-white font-medium text-md py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Book Spaces
          </Link>
            </li>
          </ul>
        </div>
        <div className='hidden md:flex items-center'>
        <Link
            className="mr-4 hover:font-bold"
            href="/contact"
          >
            Contact
          </Link>
          <Link
            href="/sign-up"
            className="inline-block text-navy border font-medium text-md py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105 mr-4"
          >
            Sign-up
          </Link>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-blue-900 to-navy text-white font-medium text-md py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Book Spaces
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;