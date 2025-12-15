'use client';

import { useState } from 'react';
import SpinningGlobe from './components/SpinningGlobe';
import AnimatedText from './components/AnimatedText';

interface Migrant {
  id: number;
  name: string;
  country_of_origin: string;
  date_of_birth: string;
  age: number | null;
  current_location: string | null;
  status: string | null;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Migrant[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/migrants/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
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
          bottom: results.length > 0 ? '400px' : '100px',
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          justifyContent: 'center',
          transition: 'bottom 0.3s ease',
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!e.target.value.trim()) {
              setResults([]);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e as any);
            }
          }}
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

      {/* Search Results */}
      {results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '20px',
          }}
        >
          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
          {results.map((migrant) => (
            <div
              key={migrant.id}
              style={{
                padding: '16px',
                marginBottom: '12px',
                border: '1px solid #eee',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                {migrant.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                <div>Country of Origin: {migrant.country_of_origin}</div>
                {migrant.date_of_birth && (
                  <div>Date of Birth: {new Date(migrant.date_of_birth).toLocaleDateString()}</div>
                )}
                {migrant.age && <div>Age: {migrant.age}</div>}
                {migrant.current_location && <div>Current Location: {migrant.current_location}</div>}
                {migrant.status && <div>Status: {migrant.status}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {isSearching && (
        <div
          style={{
            position: 'absolute',
            bottom: '350px',
            fontSize: '14px',
            color: '#666',
          }}
        >
          Searching...
        </div>
      )}
    </div>
  );
}
