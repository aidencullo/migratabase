'use client';

import { useEffect, useRef } from 'react';

export default function SpinningGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    let rotation = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;

    const drawGlobe = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw globe circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#0066cc';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw latitude lines
      for (let i = -2; i <= 2; i++) {
        const y = centerY + (i * radius / 3);
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.sqrt(radius * radius - (y - centerY) * (y - centerY)), 0, Math.PI * 2);
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw longitude lines (rotating)
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2 / 8) + rotation;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rotation += 0.02;
      requestAnimationFrame(drawGlobe);
    };

    drawGlobe();
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
