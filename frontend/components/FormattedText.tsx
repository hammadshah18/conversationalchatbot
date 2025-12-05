'use client';

import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  const formatText = (rawText: string): JSX.Element[] => {
    const lines = rawText.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    lines.forEach((line) => {
      // Large Heading (## or # at start)
      if (line.match(/^##?\s+(.+)/)) {
        const content = line.replace(/^##?\s+/, '');
        elements.push(
          <h2 key={key++} className="text-xl font-bold mt-4 mb-2 first:mt-0">
            {content}
          </h2>
        );
      }
      // Subheading (### or #### at start)
      else if (line.match(/^###\s+(.+)/)) {
        const content = line.replace(/^###\s+/, '');
        elements.push(
          <h3 key={key++} className="text-lg font-semibold mt-3 mb-2">
            {content}
          </h3>
        );
      }
      else if (line.match(/^####\s+(.+)/)) {
        const content = line.replace(/^####\s+/, '');
        elements.push(
          <h4 key={key++} className="text-base font-semibold mt-2 mb-1">
            {content}
          </h4>
        );
      }
      // Bold text (**text** or __text__)
      else if (line.match(/\*\*(.+?)\*\*|__(.+?)__/)) {
        const parts = line.split(/(\*\*(.+?)\*\*|__(.+?)__)/g);
        const formattedParts: (string | JSX.Element)[] = [];
        let partKey = 0;

        parts.forEach((part, i) => {
          if (part && !part.match(/^\*\*(.+?)\*\*$|^__(.+?)__$/)) {
            // Check if this is the content inside bold markers
            if (i > 0 && (parts[i - 1] === '**' || parts[i - 1] === '__')) {
              return; // Skip, already handled
            }
            // Regular text that might contain bold
            const boldMatches = part.match(/\*\*(.+?)\*\*|__(.+?)__/g);
            if (boldMatches) {
              const segments = part.split(/(\*\*(.+?)\*\*|__(.+?)__)/);
              segments.forEach((seg) => {
                const boldContent = seg.match(/\*\*(.+?)\*\*|__(.+?)__/);
                if (boldContent) {
                  const text = seg.replace(/\*\*|__/g, '');
                  formattedParts.push(
                    <strong key={`bold-${partKey++}`} className="font-bold">
                      {text}
                    </strong>
                  );
                } else if (seg) {
                  formattedParts.push(seg);
                }
              });
            } else {
              formattedParts.push(part);
            }
          }
        });

        elements.push(
          <p key={key++} className="mb-2">
            {formattedParts.length > 0 ? formattedParts : line}
          </p>
        );
      }
      // Bullet points (- or * at start)
      else if (line.match(/^[\-\*]\s+(.+)/)) {
        const content = line.replace(/^[\-\*]\s+/, '');
        elements.push(
          <li key={key++} className="ml-4 mb-1">
            {content}
          </li>
        );
      }
      // Numbered list (1. or 1) at start)
      else if (line.match(/^\d+[\.\)]\s+(.+)/)) {
        const content = line.replace(/^\d+[\.\)]\s+/, '');
        elements.push(
          <li key={key++} className="ml-4 mb-1 list-decimal">
            {content}
          </li>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        elements.push(<div key={key++} className="h-2" />);
      }
      // Regular paragraph
      else {
        // Still check for inline bold in regular paragraphs
        const boldPattern = /(\*\*(.+?)\*\*|__(.+?)__)/g;
        if (boldPattern.test(line)) {
          const parts: (string | JSX.Element)[] = [];
          let lastIndex = 0;
          let match;
          const regex = /(\*\*(.+?)\*\*|__(.+?)__)/g;
          
          while ((match = regex.exec(line)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
              parts.push(line.slice(lastIndex, match.index));
            }
            // Add bold text
            const boldText = match[2] || match[3];
            parts.push(
              <strong key={`inline-bold-${key++}`} className="font-bold">
                {boldText}
              </strong>
            );
            lastIndex = regex.lastIndex;
          }
          // Add remaining text
          if (lastIndex < line.length) {
            parts.push(line.slice(lastIndex));
          }

          elements.push(
            <p key={key++} className="mb-2">
              {parts}
            </p>
          );
        } else {
          elements.push(
            <p key={key++} className="mb-2">
              {line}
            </p>
          );
        }
      }
    });

    return elements;
  };

  return (
    <div className={`formatted-text ${className}`}>
      {formatText(text)}
    </div>
  );
};

export default FormattedText;
