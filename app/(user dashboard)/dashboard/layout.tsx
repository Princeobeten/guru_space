'use client';

import TopNav from '../_components/TopNav';
import BottomNav from '../_components/BottomNav';
import "../../globals.css";
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          className="container mx-auto px-4 pt-16 pb-20"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}