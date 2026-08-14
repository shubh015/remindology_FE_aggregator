import { ImageResponse } from 'next/og';

export const alt = 'Remindology — AI-Powered UPSC Learning Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 45%, #C026D3 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative dot grid, matching the site's hero background texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.14) 3px, transparent 3px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 84,
              height: 84,
              borderRadius: 22,
              background: 'rgba(255,255,255,0.95)',
              color: '#7C3AED',
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#FFFFFF' }}>
            Remindology
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
          AI-Powered UPSC Learning Platform
        </div>
      </div>
    ),
    { ...size },
  );
}
