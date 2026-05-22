import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/Avatar/Avatar';
import { Icon } from '@/components/Icon/Icon';
import { useUIStore } from '@/stores/uiStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { formatLastActive, formatPresenceLabel, getPresenceTone } from '@/stores/presencePresentation';
import styles from './UserProfile.module.css';

export function UserProfile() {
  const { userInfo } = useAuth();
  const selectedUserProfile = useUIStore(s => s.selectedUserProfile);
  const requestMessageSearch = useUIStore(s => s.requestMessageSearch);
  const requestComposerFocus = useUIStore(s => s.requestComposerFocus);
  const presences = usePresenceStore(s => s.presences);
  const batchGetPresence = usePresenceStore(s => s.batchGet);
  const subscribePresence = usePresenceStore(s => s.subscribe);
  const profile = selectedUserProfile ?? (userInfo
    ? {
        userId: userInfo.userId,
        nickname: userInfo.nickname,
        avatarUrl: userInfo.avatarUrl,
        bio: userInfo.bio,
      }
    : null);
  const profileUserId = profile?.userId;

  useEffect(() => {
    if (!profileUserId) return;
    batchGetPresence([profileUserId]);
    subscribePresence([profileUserId]);
  }, [batchGetPresence, profileUserId, subscribePresence]);

  if (!profile) return null;
  const nickname = profile.nickname || '未知';
  const details = getProfileDetails(profile.userId);
  const presence = presences[profile.userId];
  const presenceLabel = formatPresenceLabel(presence);
  const presenceTone = getPresenceTone(presence);
  const lastActive = presenceLabel === '在线' ? '' : formatLastActive(presence?.lastActiveAtMs);

  return (
    <div className={styles.profile}>
      <div className={styles.hero}>
        <div className={styles.avatarWrap}>
          <Avatar name={nickname} url={profile.avatarUrl || undefined} size={68} />
          <span className={`${styles.presenceDot} ${styles[presenceTone]}`} aria-label={presenceLabel} />
        </div>
        <div className={styles.nameRow}>
          <span>{nickname}</span>
          <strong className={styles[presenceTone]}>{presenceLabel}</strong>
        </div>
        {lastActive && <div className={styles.lastActive}>{lastActive}</div>}
        {profile.bio && <div className={styles.bio}>{profile.bio}</div>}
        <div className={styles.userId}>ID: {profile.userId}</div>
      </div>

      <div className={styles.actionGrid}>
        <button type="button" aria-label={`给 ${nickname} 发消息`} onClick={requestComposerFocus}>
          <Icon name="message-circle" size={16} />
          <span>发消息</span>
        </button>
        <button type="button" aria-label={`搜索与 ${nickname} 的聊天记录`} onClick={() => requestMessageSearch(nickname)}>
          <Icon name="search" size={16} />
          <span>搜索</span>
        </button>
        <button type="button" aria-label={`查看 ${nickname} 的共享文件`}>
          <Icon name="file-stack" size={16} />
          <span>文件</span>
        </button>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>共同群聊</div>
        {details.groups.map((group) => (
          <div className={styles.infoRow} key={group}>
            <Avatar name={group} size={26} />
            <span>{group}</span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>最近共享</div>
        {details.shared.map((item) => (
          <div className={styles.infoRow} key={item}>
            <Icon name="file-stack" size={15} />
            <span>{item}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

function getProfileDetails(userId: string) {
  switch (userId) {
    case 'u-2':
      return {
        groups: ['产品体验小组', 'UI 设计评审'],
        shared: ['liquid-console.png', 'interaction-notes.md'],
      };
    case 'u-3':
      return {
        groups: ['产品体验小组'],
        shared: ['milestone-checklist.md', 'release-notes.doc'],
      };
    case 'u-4':
      return {
        groups: ['UI 设计评审'],
        shared: ['usability-review.pdf', 'motion-feedback.md'],
      };
    default:
      return {
        groups: ['产品体验小组'],
        shared: ['chat-history.txt'],
      };
  }
}
