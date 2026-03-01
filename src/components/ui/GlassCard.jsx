const variants = {
  navbar: {
    background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
    backdropFilter: 'blur(8px) saturate(180%)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
  },
  dark: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
    backdropFilter: 'blur(8px) saturate(150%)',
    WebkitBackdropFilter: 'blur(8px) saturate(150%)',
  },
  darkStrong: {
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(8px) saturate(180%)',
    WebkitBackdropFilter: 'blur(8px) saturate(180%)',
  },
};

export function GlassCard({ children, className = '', variant = 'navbar', style = {}, onClick }) {
  return (
    <div
      className={className}
      style={{ ...variants[variant], ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
