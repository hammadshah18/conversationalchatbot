'use client';

import React from 'react';
import { Moon, Sun, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <Link href="/" className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-green-500 bg-clip-text text-transparent">
            Aivora
          </div>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Go to home"
            >
              <Home className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

