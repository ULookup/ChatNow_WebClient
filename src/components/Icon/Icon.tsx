import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import styles from './Icon.module.css';

export type IconName =
  | 'message-circle'
  | 'users'
  | 'settings'
  | 'search'
  | 'pin'
  | 'bell-off'
  | 'smile'
  | 'paperclip'
  | 'send'
  | 'info'
  | 'check'
  | 'x'
  | 'plus'
  | 'log-out'
  | 'edit'
  | 'save'
  | 'reply'
  | 'copy'
  | 'forward'
  | 'rotate-ccw'
  | 'panel-right'
  | 'file-stack';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  active?: boolean;
  variant?: 'ghost' | 'primary' | 'danger';
}

export function Icon({ name, size = 18, className = '' }: IconProps) {
  return (
    <svg
      className={`${styles.icon} ${className}`}
      style={{ '--icon-size': `${size}px` } as CSSProperties}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

export function IconButton({
  icon,
  label,
  active = false,
  variant = 'ghost',
  className = '',
  type = 'button',
  title,
  ...props
}: IconButtonProps) {
  const variantClass = variant === 'primary' ? styles.primary : variant === 'danger' ? styles.danger : '';

  return (
    <button
      {...props}
      type={type}
      className={`${styles.button} ${active ? styles.active : ''} ${variantClass} ${className}`}
      aria-label={label}
      title={title ?? label}
    >
      <Icon name={icon} />
    </button>
  );
}

const ICON_PATHS: Record<IconName, ReactNode> = {
  'message-circle': (
    <>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 9 9 0 0 1-3.8-.9L3 21l1.8-5A8.4 8.4 0 1 1 21 11.5Z" />
      <path d="M8.5 10.5h7" />
      <path d="M8.5 13.5h4.5" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.85" />
      <path d="M16 3.15a4 4 0 0 1 0 7.7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.38 1.08V21a2 2 0 1 1-4 0v-.06A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 1 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.06A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 4a1.7 1.7 0 0 0 .38-1.08V3a2 2 0 1 1 4 0v.06A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04A1.7 1.7 0 0 0 19.4 9c.2.62.78 1 1.6 1H21a2 2 0 1 1 0 4h-.06A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 17v5" />
      <path d="M5 7h14" />
      <path d="m8 7 1 10h6l1-10" />
      <path d="M9 7V3h6v4" />
    </>
  ),
  'bell-off': (
    <>
      <path d="M8.7 4.7A5.9 5.9 0 0 1 18 9.5c0 2.7 1 4.1 2 5.5H9.5" />
      <path d="M10 19a2 2 0 0 0 4 0" />
      <path d="M4 4 20 20" />
      <path d="M5.6 8.5c-.1.34-.1.67-.1 1 0 2.7-1 4.1-2 5.5h8" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
    </>
  ),
  paperclip: (
    <path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3 3 0 0 1 4.2 4.2l-8.5 8.5a1.5 1.5 0 0 1-2.1-2.1L15 8.2" />
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  check: (
    <path d="m20 6-11 11-5-5" />
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  'log-out': (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  save: (
    <>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </>
  ),
  reply: (
    <>
      <path d="m9 17-6-5 6-5" />
      <path d="M3 12h11a7 7 0 0 1 7 7v1" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  forward: (
    <>
      <path d="m15 17 6-5-6-5" />
      <path d="M21 12H10a7 7 0 0 0-7 7v1" />
    </>
  ),
  'rotate-ccw': (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </>
  ),
  'panel-right': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M15 4v16" />
      <path d="M18 9h.01" />
      <path d="M18 13h.01" />
    </>
  ),
  'file-stack': (
    <>
      <path d="M9 2h7l4 4v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M15 2v5h5" />
      <path d="M5 6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
    </>
  ),
};
