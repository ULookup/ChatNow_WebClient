import { useEffect, useMemo, useState } from 'react';
import { useContactStore } from '@/stores/contactStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { formatPresenceLabel, getPresenceTone } from '@/stores/presencePresentation';
import { useUIStore } from '@/stores/uiStore';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';
import styles from './ContactsPage.module.css';

export function FriendList() {
  const [query, setQuery] = useState('');
  const friends = useContactStore((s) => s.friends);
  const friendSearch = useContactStore((s) => s.friendSearch);
  const userSearch = useContactStore((s) => s.userSearch);
  const searchFriends = useContactStore((s) => s.searchFriends);
  const searchUsers = useContactStore((s) => s.searchUsers);
  const sendFriendRequest = useContactStore((s) => s.sendFriendRequest);
  const removeFriend = useContactStore((s) => s.removeFriend);
  const blockUser = useContactStore((s) => s.blockUser);
  const presences = usePresenceStore((s) => s.presences);
  const batchGetPresence = usePresenceStore((s) => s.batchGet);
  const subscribePresence = usePresenceStore((s) => s.subscribe);
  const setSelectedUserProfile = useUIStore((s) => s.setSelectedUserProfile);
  const openRightPanel = useUIStore((s) => s.openRightPanel);

  useEffect(() => {
    const userIds = friends.map((friend) => friend.userId).filter(Boolean);
    if (userIds.length === 0) return;
    batchGetPresence(userIds);
    subscribePresence(userIds);
  }, [batchGetPresence, friends, subscribePresence]);

  const queryText = query.trim();
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';

  useEffect(() => {
    if (isPreview) return;
    searchFriends(query);
    searchUsers(query);
  }, [isPreview, query, searchFriends, searchUsers]);

  const visibleFriends = useMemo(() => {
    if (queryText && !isPreview && !friendSearch.loading && !friendSearch.failed && friendSearch.query === queryText) {
      return friendSearch.friends;
    }
    const keyword = queryText.toLowerCase();
    if (!keyword) return friends;

    return friends.filter((friend) => (
      friend.nickname.toLowerCase().includes(keyword)
      || friend.phone.toLowerCase().includes(keyword)
      || friend.userId.toLowerCase().includes(keyword)
    ));
  }, [friendSearch, friends, isPreview, queryText]);
  const visibleUsers = useMemo(() => {
    if (!queryText || isPreview || userSearch.loading || userSearch.failed || userSearch.query !== queryText) {
      return [];
    }
    const friendIds = new Set(friends.map((friend) => friend.userId));
    return userSearch.users.filter((user) => !friendIds.has(user.userId));
  }, [friends, isPreview, queryText, userSearch]);

  const openFriendProfile = (friend: typeof friends[number]) => {
    setSelectedUserProfile({
      userId: friend.userId,
      nickname: friend.nickname || '未知',
      avatarUrl: friend.avatarUrl,
      bio: friend.bio,
    });
    openRightPanel('user_profile');
  };

  return (
    <div className={styles.friendSection}>
      <div className={styles.friendSearch}>
        <input
          value={query}
          placeholder="搜索好友或全站用户"
          aria-label="搜索好友或全站用户"
          onChange={(event) => setQuery(event.target.value)}
        />
        {queryText && !isPreview && (friendSearch.loading || userSearch.loading) && (
          <span className={styles.searchState}>搜索中</span>
        )}
      </div>
      {queryText && !isPreview && friendSearch.failed && (
        <div className={styles.searchHint}>后端搜索暂不可用，已显示本地匹配</div>
      )}
      {queryText && !isPreview && userSearch.failed && (
        <div className={styles.searchHint}>全站用户搜索暂不可用</div>
      )}
      <div className={styles.friendList}>
      {visibleFriends.map((friend) => {
        const nickname = friend.nickname || '未知';
        const presence = presences[friend.userId];
        const presenceLabel = formatPresenceLabel(presence);
        const presenceTone = getPresenceTone(presence);

        return (
          <div
            key={friend.userId}
            className={styles.friendItem}
          >
            <div className={styles.friendAvatar}>
              <Avatar name={nickname} url={friend.avatarUrl || undefined} size={28} />
              <span
                className={`${styles.friendPresence} ${styles[presenceTone]}`}
                aria-label={`${nickname} 当前状态：${presenceLabel}`}
              />
            </div>
            <span className={styles.friendName}>{nickname}</span>
            <IconButton
              icon="info"
              label={`查看 ${nickname} 资料`}
              className={styles.friendAction}
              onClick={() => openFriendProfile(friend)}
            />
            <IconButton
              icon="trash"
              label={`移除 ${nickname}`}
              variant="danger"
              className={styles.friendAction}
              onClick={() => removeFriend(friend.userId)}
            />
            <IconButton
              icon="eye-off"
              label={`拉黑 ${nickname}`}
              variant="danger"
              className={styles.friendAction}
              onClick={() => blockUser(friend.userId)}
            />
          </div>
        );
      })}
      {friends.length === 0 && (
        <div className={styles.empty}>
          暂无好友
        </div>
      )}
      {friends.length > 0 && visibleFriends.length === 0 && (
        <div className={styles.empty}>
          没有匹配的好友
        </div>
      )}
      </div>
      {visibleUsers.length > 0 && (
        <div className={styles.globalResults}>
          <div className={styles.resultTitle}>全站用户</div>
          {visibleUsers.map((user) => {
            const nickname = user.nickname || '未知';
            return (
              <div className={styles.friendItem} key={user.userId}>
                <div className={styles.friendAvatar}>
                  <Avatar name={nickname} url={user.avatarUrl || undefined} size={28} />
                </div>
                <span className={styles.friendName}>{nickname}</span>
                <IconButton
                  icon="info"
                  label={`查看 ${nickname} 资料`}
                  className={styles.friendAction}
                  onClick={() => openFriendProfile(user)}
                />
                <IconButton
                  icon="plus"
                  label={`添加 ${nickname}`}
                  variant="primary"
                  className={styles.friendAction}
                  onClick={() => sendFriendRequest(user.userId)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
