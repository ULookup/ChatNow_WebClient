import { useAuth } from '@/hooks/useAuth';
import { useUIStore, type Module } from '@/stores/uiStore';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './NavRail.module.css';

const NAV_ITEMS: Array<{ module: Module; icon: string; label: string }> = [
  { module: 'chat', icon: '💬', label: '聊天' },
  { module: 'contacts', icon: '👤', label: '联系人' },
  { module: 'settings', icon: '⚙', label: '设置' },
];

export function NavRail() {
  const activeModule = useUIStore(s => s.activeModule);
  const switchModule = useUIStore(s => s.switchModule);
  const { userInfo } = useAuth();

  return (
    <nav className={styles.rail}>
      <div className={styles.topSection}>
        <Avatar
          name={userInfo?.nickname ?? 'U'}
          size={36}
          gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))"
          onClick={() => switchModule('settings')}
        />
      </div>
      <div className={styles.navItems}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.module}
            className={`${styles.navIcon} ${activeModule === item.module ? styles.active : ''}`}
            onClick={() => switchModule(item.module)}
            title={item.label}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
