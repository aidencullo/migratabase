'use client';

import { useState, useEffect } from 'react';

const names = ['mike', 'carmen velasquez', 'juan rodriguez', 'maria garcia', 'ahmed hassan'];

export default function AnimatedText() {
  const [displayText, setDisplayText] = useState('where is mike?');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typeSpeed = 100;
    const deleteSpeed = 50;
    const pauseTime = 2000;

    const timeout = setTimeout(() => {
      const currentName = names[currentNameIndex];
      const baseText = 'where is ';

      if (!isDeleting) {
        // Typing phase
        if (charIndex < currentName.length) {
          setDisplayText(baseText + currentName.substring(0, charIndex + 1) + '?');
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting phase
        if (charIndex > 0) {
          setDisplayText(baseText + currentName.substring(0, charIndex - 1) + '?');
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next name
          setIsDeleting(false);
          setCurrentNameIndex((prev) => (prev + 1) % names.length);
        }
      }
    }, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentNameIndex]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '24px',
        color: '#333',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '32px' }}>💬</span>
      <span>{displayText}</span>
    </div>
  );
}
