'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 py-2">
      <motion.div
        className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 0,
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 0,
          delay: 0.4,
        }}
      />
    </div>
  );
};

export default Loader;
