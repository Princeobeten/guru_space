"use client";

import Link from 'next/link';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-navy text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">
          Guru Space
        </Link>
        <div className="hidden md:flex pt-1">
          <Link
            className="mr-4 hover:font-bold hover:text-blue-900"
            href="/"
          >
            Home
          </Link>
          <Link
            className="mr-4 hover:font-bold hover:text-blue-900"
            href="/about"
          >
            About
          </Link>
          <Link
            className="mr-4 hover:font-bold hover:text-blue-900"
            href="/space"
          >
            Explore Spaces
          </Link>
          <Link
            className="mr-4 hover:font-bold hover:text-blue-900"
            href="/contact"
          >
            Contact
          </Link>
        </div>
        <div className="md:hidden">
          <button
            className="bg-transparent border-0 p-2"
            onClick={handleMenuToggle}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden fixed top-0 left-0 w-full h-screen bg-navy text-white p-4 z-50`}
        >
          <button
            className="bg-transparent border-0 p-2 absolute top-4 right-4"
            onClick={handleMenuToggle}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <ul className="pt-12 text-center">
            <li>
              <Link
                className="block py-2 hover:font-bold hover:text-blue-900"
                href="/"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="block py-2 hover:font-bold hover:text-blue-900"
                href="/about"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className="block py-2 hover:font-bold hover:text-blue-900"
                href="/space"
              >
                Explore Spaces
              </Link>
            </li>
            <li>
              <Link
                className="block py-2 hover:font-bold hover:text-blue-900"
                href="/contact"
              >
                Contact
              </Link>
            </li>
            <li>
            <Link
            href="/login"
            className="mt-10 inline-block bg-gradient-to-r from-blue-400 to-blue-900 text-white font-medium text-md py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Book Spaces
          </Link>
            </li>
          </ul>
        </div>
        <div>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-blue-400 to-blue-900 text-white font-medium text-md py-2 px-4 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Book Spaces
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;