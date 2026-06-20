export default function Spinner({ size = 24, color = '#6366f1' }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `3px solid rgba(99, 102, 241, 0.2)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin-slow 0.8s linear infinite',
      display: 'inline-block',
    }} />
  );
}
