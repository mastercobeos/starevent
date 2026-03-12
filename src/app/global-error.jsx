'use client';

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#080b1a', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#c58c07',
                color: '#080b1a',
                border: '2px solid #C9A84C',
                borderRadius: '0.5rem',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
