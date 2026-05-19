import type { ReactNode } from 'react';
import { NavRail } from '@/components/NavRail/NavRail';
import { useUIStore } from '@/stores/uiStore';
import styles from './MainLayout.module.css';

interface Props {
  leftPanel: ReactNode;
  mainContent: ReactNode;
  rightPanel?: ReactNode;
}

export function MainLayout({ leftPanel, mainContent, rightPanel }: Props) {
  const rightPanelOpen = useUIStore(s => s.rightPanelOpen);

  return (
    <div className={styles.layout}>
      <NavRail />
      <div className={styles.leftPanel}>{leftPanel}</div>
      <div className={styles.mainContent}>{mainContent}</div>
      {rightPanelOpen && rightPanel && (
        <div className={styles.rightPanel}>{rightPanel}</div>
      )}
    </div>
  );
}
