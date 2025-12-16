'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function SpinningGlobe() {
  const globeRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (globeRef.current && mounted) {
      // Auto-rotate the globe
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 1;
    }
  }, [mounted]);

  const globeSize = 500;

  if (!mounted) {
    return (
      <div style={{ width: `${globeSize}px`, height: `${globeSize}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: `${globeSize * 0.7}px`, height: `${globeSize * 0.7}px`, borderRadius: '50%', border: '3px solid #0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '14px', color: '#0066cc' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: `${globeSize}px`, height: `${globeSize}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#0066cc"
        atmosphereAltitude={0.15}
        width={globeSize}
        height={globeSize}
      />
    </div>
  );
}
