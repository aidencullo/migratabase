'use client';

import { useState } from 'react';
import SpinningGlobe from './components/SpinningGlobe';
import AnimatedText from './components/AnimatedText';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`/api/migrants/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      console.log('Search results:', data);
      // TODO: Display results
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        position: 'relative',
      }}
    >
      {/* Spinning Globe */}
      <div style={{ marginBottom: '100px' }}>
        <SpinningGlobe />
      </div>

      {/* Animated Text */}
      <AnimatedText />

      {/* Search Textbox */}
      <form
        onSubmit={handleSearch}
        style={{
          position: 'absolute',
          bottom: '100px',
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for someone..."
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: '18px',
            border: '2px solid #ddd',
            borderRadius: '50px',
            outline: 'none',
            transition: 'border-color 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0066cc';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd';
          }}
        />
      </form>
    </div>
  );
}
