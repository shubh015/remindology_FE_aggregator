import { ImageResponse } from 'next/og';

export const alt = 'Remindology — AI-Powered UPSC Learning Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Minimal monochrome card matching the site: ink on paper, one gold dot.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: '#F7F7F7',
          color: '#0B0B0B',
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 48 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 6,
              background: '#0B0B0B',
              color: '#F7F7F7',
              fontSize: 40,
              fontWeight: 500,
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 500, letterSpacing: 10 }}>
            REMINDOLOGY
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 84, fontWeight: 300, lineHeight: 1.05, maxWidth: 900 }}>
          Your personal learning intelligence.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 44, fontSize: 24, color: '#646464', letterSpacing: 4 }}>
          <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 12, background: '#F2B620' }} />
          AI-POWERED UPSC LEARNING PLATFORM
        </div>
      </div>
    ),
    { ...size },
  );
}
