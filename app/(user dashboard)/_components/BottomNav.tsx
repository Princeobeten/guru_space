'use client';

import { HomeIcon, ReceiptTextIcon, UserIcon, PlusCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

type NavItem = {
  icon: typeof HomeIcon;
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  {
    icon: HomeIcon,
    label: 'Home',
    href: '/dashboard',
  },
  {
    icon: PlusCircleIcon,
    label: 'Booking',
    href: '/booking',
  },
  {
    icon: ReceiptTextIcon,
    label: 'Transaction',
    href: '/transaction',
  },
  {
    icon: UserIcon,
    label: 'Profile',
    href: '/profile',
  },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full border-t bg-navy px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200',
                'hover:bg-blue-900 hover:scale-105',
                isActive ? 'text-blue-600' : 'text-white'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 h-1 w-12 bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;