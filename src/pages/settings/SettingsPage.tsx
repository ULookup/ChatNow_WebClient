import { MainLayout } from '@/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Icon } from '@/components/Icon/Icon';
import { ProfileEdit } from './ProfileEdit';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { logout } = useAuth();

  return (
    <MainLayout
      leftPanel={
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>设置</div>
          <div className={`${styles.menuItem} ${styles.active}`}>
            <Icon name="edit" size={16} />
            个人资料
          </div>
          <div className={styles.menuItem}>
            <Icon name="settings" size={16} />
            通用设置
          </div>
          <div className={styles.menuItem}>
            <Icon name="info" size={16} />
            关于
          </div>
          <button type="button" className={styles.menuItemDanger} onClick={logout}>
            <Icon name="log-out" size={16} />
            退出登录
          </button>
        </div>
      }
      mainContent={<ProfileEdit />}
    />
  );
}
