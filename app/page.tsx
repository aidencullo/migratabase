'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

type MigrantSuggestion = Pick<Migrant, 'id' | 'name' | 'country_of_origin'>;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Migrant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<MigrantSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const suggestionsCache = useRef(new Map<string, MigrantSuggestion[]>());
  const suggestionsAbortController = useRef<AbortController | null>(null);

  const suggestionKey = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const runSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/migrants/search?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    const key = query.trim().toLowerCase();

    const cached = suggestionsCache.current.get(key);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    suggestionsAbortController.current?.abort();
    const controller = new AbortController();
    suggestionsAbortController.current = controller;

    setIsSuggesting(true);
    try {
      const response = await fetch(
        `/api/migrants/suggestions?q=${encodeURIComponent(query)}&limit=8`,
        { signal: controller.signal }
      );
      const data = await response.json();
      const list: MigrantSuggestion[] = Array.isArray(data) ? data : [];
      suggestionsCache.current.set(key, list);
      setSuggestions(list);
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error('Suggestions error:', error);
      }
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    await runSearch(searchQuery);
  };

  const applySuggestion = async (s: MigrantSuggestion) => {
    setSearchQuery(s.name);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    await runSearch(s.name);
  };

  // Prefetch suggestions as you type (debounced).
  useEffect(() => {
    if (!showSuggestions) return;

    const handle = setTimeout(() => {
      fetchSuggestions(searchQuery);
      setActiveSuggestionIndex(-1);
    }, 150);

    return () => clearTimeout(handle);
  }, [searchQuery, showSuggestions]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        position: 'relative',
        padding: '20px',
      }}
    >
      {/* Left side - Text and Search */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '600px',
        }}
      >
        {/* Animated Text */}
        <AnimatedText />

        {/* Search Textbox */}
        <form
          onSubmit={handleSearch}
          style={{
            marginTop: '40px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
        <div style={{ width: '100%', position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const next = e.target.value;
              setSearchQuery(next);
              if (!next.trim()) {
                setResults([]);
              }
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return;

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
                e.preventDefault();
                void applySuggestion(suggestions[activeSuggestionIndex]);
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
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
              setShowSuggestions(true);
              void fetchSuggestions(searchQuery);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd';
              // Let click events on suggestions win before hiding.
              setTimeout(() => {
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
              }, 100);
            }}
            role="combobox"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="migrant-suggestions"
          />

          {showSuggestions && (isSuggesting || suggestions.length > 0) && (
            <div
              id="migrant-suggestions"
              role="listbox"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 'calc(100% + 8px)',
                backgroundColor: 'white',
                border: '1px solid #eee',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: '#666',
                  borderBottom: suggestions.length > 0 ? '1px solid #f0f0f0' : undefined,
                }}
              >
                {suggestionKey ? 'Suggestions' : 'Recent'}
                {isSuggesting ? ' • loading…' : ''}
              </div>

              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => {
                  const isActive = idx === activeSuggestionIndex;
                  return (
                    <div
                      key={s.id}
                      role="option"
                      aria-selected={isActive}
                      onMouseDown={(e) => {
                        // Prevent blur from hiding the menu before click.
                        e.preventDefault();
                        void applySuggestion(s);
                      }}
                      style={{
                        padding: '12px 14px',
                        cursor: 'pointer',
                        backgroundColor: isActive ? '#f2f7ff' : 'white',
                        borderTop: idx === 0 ? 'none' : '1px solid #f6f6f6',
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {s.country_of_origin}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '12px 14px', fontSize: '13px', color: '#666' }}>
                  No suggestions.
                </div>
              )}
            </div>
          )}
        </div>
        </form>

        {/* Search Results */}
        {results.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              width: '100%',
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
              marginTop: '20px',
              fontSize: '14px',
              color: '#666',
            }}
          >
            Searching...
          </div>
        )}
      </div>

      {/* Right side - Spinning Globe */}
      <div style={{ 
        position: 'absolute',
        right: '-200px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <SpinningGlobe />
      </div>
    </div>
  );
}
