import styles from './Avatar.module.css';

interface Props {
  url?: string;
  name?: string;
  size?: number;
  gradient?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

const GRADIENTS = [
  'linear-gradient(135deg, #a8edea, #fed6e3)',
  'linear-gradient(135deg, #ffd89b, #f7a1a1)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #d4fc79, #96e6a1)',
  'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
];

function hashGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function Avatar({ url, name, size = 36, gradient, onClick, ariaLabel }: Props) {
  const bg = gradient || (name ? hashGradient(name) : GRADIENTS[0]);
  return (
    <div
      className={styles.avatar}
      style={{
        width: size, height: size, borderRadius: size > 32 ? 12 : 8,
        background: url ? `url(${url}) center/cover` : bg,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? (ariaLabel ?? name) : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {!url && name && (
        <span className={styles.initials} style={{ fontSize: size * 0.35 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
