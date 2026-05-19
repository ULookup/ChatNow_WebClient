import { MainLayout } from '@/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { ProfileEdit } from './ProfileEdit';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { logout } = useAuth();

  return (
    <MainLayout
      leftPanel={
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>设置</div>
          <div className={styles.menuItem}>个人资料</div>
          <div className={styles.menuItem}>通用设置</div>
          <div className={styles.menuItem}>关于</div>
          <div className={styles.menuItemDanger} onClick={logout}>退出登录</div>
        </div>
      }
      mainContent={<ProfileEdit />}
    />
  );
}
