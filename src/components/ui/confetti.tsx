'use client';

import { useState, useEffect } from 'react';

const CONFETTI_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#EF4444', '#06B6D4'];

interface ConfettiPiece {
  id: number; originLeft: string; color: string; size: number;
  delay: string; duration: string; isCircle: boolean; isWide: boolean;
  dxMid: number; dyMid: number; dxEnd: number; dyEnd: number; rotMid: number; rotEnd: number;
}

export function Confetti({ count = 60 }: { count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
    setPieces(Array.from({ length: count }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const power    = 0.7 + Math.random() * 0.6;
      const dxMid = (fromLeft ? 1 : -1) * (vw * 0.12 + Math.random() * vw * 0.1) * power;
      const dyMid = -(140 + Math.random() * 160);
      const dxEnd = dxMid + (fromLeft ? 1 : -1) * (40 + Math.random() * vw * 0.18);
      const dyEnd = dyMid + (380 + Math.random() * 260);
      return {
        id: i,
        originLeft: fromLeft ? `${2 + Math.random() * 8}%` : `${88 + Math.random() * 8}%`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 7 + Math.random() * 6,
        delay: `${(Math.random() * 0.35).toFixed(2)}s`,
        duration: `${(1.6 + Math.random() * 0.7).toFixed(2)}s`,
        isCircle: i % 4 === 0,
        isWide: i % 5 === 2,
        dxMid, dyMid, dxEnd, dyEnd,
        rotMid: Math.round(Math.random() * 360),
        rotEnd: Math.round(480 + Math.random() * 480),
      };
    }));
    const hide = setTimeout(() => setVisible(false), 2700);
    return () => clearTimeout(hide);
  }, [count]);

  if (!visible || !pieces.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0"
          style={{
            left: p.originLeft,
            width: p.isWide ? p.size * 1.8 : p.isCircle ? p.size : p.size * 0.7,
            height: p.size,
            background: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `confettiBurst ${p.duration} cubic-bezier(0.16,0.84,0.44,1) ${p.delay} both`,
            '--dx-mid': `${p.dxMid}px`,
            '--dy-mid': `${p.dyMid}px`,
            '--dx-end': `${p.dxEnd}px`,
            '--dy-end': `${p.dyEnd}px`,
            '--rot-mid': `${p.rotMid}deg`,
            '--rot-end': `${p.rotEnd}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
