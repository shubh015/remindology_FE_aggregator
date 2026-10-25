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
          background: '#16233E',
          position: 'relative',
        }}
      >
        {/* Quiet brass wash, matching the site's hero background texture */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138,106,18,0.35) 0%, transparent 68%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: '#24365C',
              border: '3px solid #8A6A12',
              color: '#D4AF37',
              fontSize: 44,
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
            }}
          >
            R
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#F7F4EC' }}>
            Remindology
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 32, fontWeight: 600, color: 'rgba(247,244,236,0.85)', position: 'relative' }}>
          AI-Powered UPSC Learning Platform
        </div>
      </div>
    ),
    { ...size },
  );
}
