'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function HeartPage() {
  const [heartElements, setHeartElements] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Hide header and footer for this page
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const mainDiv = document.querySelector('div.min-h-screen');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (mainDiv) mainDiv.style.marginTop = '0';
    
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
      if (mainDiv) mainDiv.style.marginTop = '';
    };
  }, []);

  useEffect(() => {
    // Generate text elements that form a heart shape
    const elements: Array<{ id: number; x: number; y: number; delay: number }> = [];
    let id = 0;

    // Improved heart shape using parametric equations
    for (let t = 0; t < Math.PI * 2; t += 0.08) {
      const r = 0.15 + 0.1 * Math.cos(t);
      
      // Top left circle
      const lx = 0.3 + r * Math.cos(t);
      const ly = 0.35 + r * Math.sin(t) * 1.2;
      if (lx > 0.15 && lx < 0.45 && ly > 0.15 && ly < 0.55) {
        for (let i = 0; i < 2; i++) {
          elements.push({
            id: id++,
            x: lx + (Math.random() - 0.5) * 0.04,
            y: ly + (Math.random() - 0.5) * 0.04,
            delay: Math.random() * 0.8,
          });
        }
      }
      
      // Top right circle
      const rx = 0.7 + r * Math.cos(t);
      const ry = 0.35 + r * Math.sin(t) * 1.2;
      if (rx > 0.55 && rx < 0.85 && ry > 0.15 && ry < 0.55) {
        for (let i = 0; i < 2; i++) {
          elements.push({
            id: id++,
            x: rx + (Math.random() - 0.5) * 0.04,
            y: ry + (Math.random() - 0.5) * 0.04,
            delay: Math.random() * 0.8,
          });
        }
      }
    }

    // Bottom point - triangle shape converging
    for (let x = 0.3; x <= 0.7; x += 0.04) {
      for (let y = 0.55; y <= 0.85; y += 0.06) {
        const distFromCenter = Math.abs(x - 0.5);
        const maxWidth = Math.max(0, 0.2 - (y - 0.55) * 0.5);
        
        if (distFromCenter <= maxWidth) {
          for (let i = 0; i < 2; i++) {
            elements.push({
              id: id++,
              x: x + (Math.random() - 0.5) * 0.04,
              y: y + (Math.random() - 0.5) * 0.04,
              delay: Math.random() * 0.8,
            });
          }
        }
      }
    }

    // Add outline elements for better definition
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      
      // Left bump outline
      elements.push({
        id: id++,
        x: 0.3 + 0.16 * Math.cos(angle),
        y: 0.35 + 0.2 * Math.sin(angle),
        delay: Math.random() * 0.8,
      });
      
      // Right bump outline
      elements.push({
        id: id++,
        x: 0.7 + 0.16 * Math.cos(angle),
        y: 0.35 + 0.2 * Math.sin(angle),
        delay: Math.random() * 0.8,
      });
    }

    setHeartElements(elements);
  }, []);

  return (
    <div className="w-full min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/5 via-background to-background pointer-events-none" />

      {/* Heart container */}
      <div className="relative w-full h-screen flex items-center justify-center perspective">
        {/* Animated text elements forming the heart */}
        <div className="relative" style={{ width: '480px', height: '480px' }}>
          {heartElements.map((element, index) => (
            <div
              key={element.id}
              className="absolute float-container"
              style={{
                left: `${element.x * 100}%`,
                top: `${element.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${element.delay}s`,
              }}
            >
              <div 
                className={`love-text ${index % 2 === 0 ? 'float-left' : 'float-right'}`}
                style={{
                  animationDelay: `${element.delay}s`,
                  fontSize: '0.75rem',
                }}
              >
                i love you
              </div>
            </div>
          ))}
        </div>

        {/* Outer heart outline */}
        <div className="absolute pointer-events-none" style={{ width: '480px', height: '480px' }}>
          <svg
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
            style={{
              filter: 'drop-shadow(0 0 25px rgba(234, 128, 176, 0.5))',
            }}
          >
            {/* Heart outline */}
            <path
              d="M50,90 C20,70 5,55 5,40 C5,25 15,15 25,15 C35,15 45,25 50,35 C55,25 65,15 75,15 C85,15 95,25 95,40 C95,55 80,70 50,90 Z"
              fill="none"
              stroke="#ea80b0"
              strokeWidth="1.2"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      {/* Central glow effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
           style={{ width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(234, 128, 176, 0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} 
      />
    </div>
  );
}
