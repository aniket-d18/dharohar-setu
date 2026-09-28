import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Dharohar Setu — Living Cultural Atlas of India';
export const size = {
  width: 1200,
  height: 630,
};
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
          backgroundColor: '#FAF7F1',
          backgroundImage: 'radial-gradient(circle at 50% 30%, #FFFFFF 0%, #FAF7F1 75%, #F3EBDD 100%)',
          padding: '60px 80px',
          border: '16px solid #E4DDD0',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Subtle Ornamental Inner Border */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '2px dashed #C97A3D',
            opacity: 0.35,
            borderRadius: '16px',
          }}
        />

        {/* Brand Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(47, 110, 93, 0.1)',
            border: '1.5px solid rgba(47, 110, 93, 0.3)',
            borderRadius: '999px',
            padding: '8px 24px',
            marginBottom: '28px',
          }}
        >
          <span style={{ fontSize: '20px', color: '#2F6E5D', fontWeight: 600, fontFamily: 'sans-serif' }}>
            ✦ National Intangible Heritage Repository
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '76px',
            fontWeight: 700,
            color: '#2A2420',
            letterSpacing: '-1px',
            textAlign: 'center',
            marginBottom: '18px',
            lineHeight: 1.1,
          }}
        >
          Dharohar Setu
        </div>

        {/* Subtitle / Tagline */}
        <div
          style={{
            fontSize: '28px',
            color: '#C97A3D',
            fontWeight: 600,
            fontFamily: 'sans-serif',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Preserving India's Living Cultural Atlas &amp; Endangered Oral Traditions
        </div>

        {/* Description Pill */}
        <div
          style={{
            fontSize: '20px',
            color: 'rgba(42, 36, 32, 0.75)',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.5,
          }}
        >
          Community crowdsourcing, dialect recording, and AI speech preservation across 36 States &amp; Union Territories
        </div>

        {/* Bottom Feature Tags */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
            fontFamily: 'sans-serif',
            fontSize: '16px',
            color: '#2F6E5D',
            fontWeight: 600,
          }}
        >
          <span>🎵 Folk Melodies</span>
          <span>•</span>
          <span>📖 Oral Lore</span>
          <span>•</span>
          <span>🏺 Artisanal Craft</span>
          <span>•</span>
          <span>🗣️ Dialect Vitality Map</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
