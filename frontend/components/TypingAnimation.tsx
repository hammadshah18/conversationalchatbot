'use client';

import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 20,
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className="whitespace-pre-wrap break-words">
      <FormattedText text={displayedText} />
      {currentIndex < text.length && (
        <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
      )}
    </span>
  );
};

export default TypingAnimation;
