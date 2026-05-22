import { useMemo, useState } from 'react';
import type { Message, MessageContent, ReactionGroup } from '@/proto/message/message_types';
import { MessageStatus } from '@/proto/message/message_types';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useChatStore } from '@/stores/chatStore';
import { formatPresenceLabel, getPresenceTone } from '@/stores/presencePresentation';
import { Avatar } from '@/components/Avatar/Avatar';
import { IconButton } from '@/components/Icon/Icon';
import { getMessageTextPreview } from '../messageComposer';
import { formatMessageClock, getMessageSenderLabel, getMessageSenderProfile } from '../messagePresentation';
import { TextBubble } from './TextBubble';
import { ImageBubble } from './ImageBubble';
import { FileBubble } from './FileBubble';
import { AudioBubble } from './AudioBubble';
import { VideoBubble } from './VideoBubble';
import { LocationBubble } from './LocationBubble';
import { MessageStatusIndicator, type DeliveryState } from './MessageStatusIndicator';
import styles from './MessageBubble.module.css';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '✨', '👀'];

interface Props {
  message: Message;
  searchQuery?: string;
}

export function MessageBubble({ message, searchQuery = '' }: Props) {
  const isPreview = new URLSearchParams(window.location.search).get('preview') === '1';
  const userId = useAuthStore((s) => s.userId);
  const setReplyTarget = useUIStore((s) => s.setReplyTarget);
  const openRightPanel = useUIStore((s) => s.openRightPanel);
  const setSelectedUserProfile = useUIStore((s) => s.setSelectedUserProfile);
  const addToast = useUIStore((s) => s.addToast);
  const senderPresence = usePresenceStore((s) => s.presences[message.senderId]);
  const addMessageReaction = useChatStore((s) => s.addReaction);
  const removeMessageReaction = useChatStore((s) => s.removeReaction);
  const refreshMessageReactions = useChatStore((s) => s.refreshMessageReactions);
  const recallMessage = useChatStore((s) => s.recallMessage);
  const pinMessage = useChatStore((s) => s.pinMessage);
  const unpinMessage = useChatStore((s) => s.unpinMessage);
  const deleteMessages = useChatStore((s) => s.deleteMessages);
  const fetchMessagesById = useChatStore((s) => s.fetchMessagesById);
  const retryMessage = useChatStore((s) => s.retryMessage);
  const handleMessagePinned = useChatStore((s) => s.handleMessagePinned);
  const handleMessagesDeleted = useChatStore((s) => s.handleMessagesDeleted);
  const isSelf = message.senderId === userId;
  const deliveryState = getDeliveryState(message);
  const [locallyRecalled, setLocallyRecalled] = useState(false);
  const [locallyPinned, setLocallyPinned] = useState(message.isPinned);
  const [locallyDeleted, setLocallyDeleted] = useState(false);
  const [hydratedReplyPreview, setHydratedReplyPreview] = useState('');
  const [replyHydrating, setReplyHydrating] = useState(false);
  const isRecalled = locallyRecalled || message.status === MessageStatus.RECALLED;
  const isDeleted = locallyDeleted || message.status === MessageStatus.DELETED;
  const containerClass = `${styles.container} ${isSelf ? styles.self : styles.other}`;
  const [reactionTrayOpen, setReactionTrayOpen] = useState(false);
  const [reactionOverrides, setReactionOverrides] = useState<Record<string, ReactionGroup>>({});
  const reactionGroups = useMemo(
    () => mergeReactionGroups(message.reactions, Object.values(reactionOverrides)),
    [message.reactions, reactionOverrides],
  );

  if (isRecalled) {
    return (
      <div className={containerClass}>
        <div className={styles.recalled}>消息已被撤回</div>
      </div>
    );
  }

  if (isDeleted) {
    return (
      <div className={containerClass}>
        <div className={styles.recalled}>消息已被删除</div>
      </div>
    );
  }

  const content = message.content;
  const messageTime = formatMessageClock(message.createdAtMs);
  const senderProfile = getMessageSenderProfile(message.senderId);
  const presenceLabel = formatPresenceLabel(senderPresence);
  const presenceTone = getPresenceTone(senderPresence);
  const openSenderProfile = () => {
    setSelectedUserProfile(senderProfile);
    openRightPanel('user_profile');
  };
  const handleCopy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(getMessageTextPreview(message));
      addToast('消息已复制', 'success');
    } catch {
      addToast('复制失败，请重试', 'error');
    }
  };
  const handleHydrateReply = async () => {
    const replyTo = message.replyTo;
    if (!replyTo || isPreview || replyHydrating) return;
    setReplyHydrating(true);
    try {
      const messages = await fetchMessagesById(message.conversationId, [replyTo.repliedMessageId]);
      const original = messages.find((item) => item.messageId === replyTo.repliedMessageId);
      if (original) {
        setHydratedReplyPreview(getMessageTextPreview(original));
        addToast('已补全被回复消息', 'success');
      } else {
        addToast('未找到被回复消息', 'error');
      }
    } catch {
      addToast('获取被回复消息失败', 'error');
    } finally {
      setReplyHydrating(false);
    }
  };
  const handleRecall = async () => {
    setLocallyRecalled(true);
    if (isPreview) return;

    try {
      await recallMessage(message.conversationId, message.messageId);
      addToast('消息已撤回', 'success');
    } catch {
      setLocallyRecalled(false);
      addToast('撤回失败，请重试', 'error');
    }
  };
  const handleTogglePin = async () => {
    const nextPinned = !locallyPinned;
    setLocallyPinned(nextPinned);
    handleMessagePinned(message.conversationId, message.messageId, nextPinned);

    if (isPreview) return;

    try {
      if (nextPinned) {
        await pinMessage(message.conversationId, message.messageId);
        addToast('消息已置顶', 'success');
      } else {
        await unpinMessage(message.conversationId, message.messageId);
        addToast('已取消置顶', 'success');
      }
    } catch {
      setLocallyPinned(!nextPinned);
      handleMessagePinned(message.conversationId, message.messageId, !nextPinned);
      addToast(nextPinned ? '置顶失败，请重试' : '取消置顶失败，请重试', 'error');
    }
  };
  const handleDelete = async () => {
    setLocallyDeleted(true);
    if (isPreview) {
      handleMessagesDeleted(message.conversationId, [message.messageId]);
      return;
    }

    try {
      await deleteMessages(message.conversationId, [message.messageId]);
      addToast('消息已删除', 'success');
    } catch {
      setLocallyDeleted(false);
      addToast('删除失败，请重试', 'error');
    }
  };
  const handleRetry = async () => {
    try {
      await retryMessage(message.conversationId, message.clientMsgId);
      addToast('消息正在重发', 'success');
    } catch {
      addToast('重试发送失败，请稍后再试', 'error');
    }
  };
  const applyLocalReaction = (emoji: string) => {
    const current = getCurrentReaction(message.reactions, reactionOverrides, emoji);
    if (current?.selfReacted) return false;

    setReactionOverrides((overrides) => {
      const latest = getCurrentReaction(message.reactions, overrides, emoji);
      if (latest?.selfReacted) return overrides;
      return {
        ...overrides,
        [emoji]: {
          emoji,
          count: (latest?.count ?? 0) + 1,
          recentUserIds: addUserId(latest?.recentUserIds ?? [], userId),
          selfReacted: true,
        },
      };
    });
    return true;
  };
  const addReaction = async (emoji: string) => {
    const added = applyLocalReaction(emoji);
    setReactionTrayOpen(false);
    if (!added || isPreview) return;

    try {
      await addMessageReaction(message.conversationId, message.messageId, emoji, userId);
    } catch {
      addToast('表情回应失败，请重试', 'error');
    }
  };
  const toggleReaction = async (emoji: string) => {
    const current = getCurrentReaction(message.reactions, reactionOverrides, emoji);
    const shouldAdd = Boolean(current && !current.selfReacted);
    const shouldRemove = Boolean(current?.selfReacted);
    if (!current) return;

    setReactionOverrides((overrides) => {
      const latest = getCurrentReaction(message.reactions, overrides, emoji);
      if (!latest) return overrides;

      const selfReacted = !latest.selfReacted;
      const count = latest.count + (selfReacted ? 1 : -1);
      return {
        ...overrides,
        [emoji]: {
          ...latest,
          count,
          recentUserIds: selfReacted
            ? addUserId(latest.recentUserIds, userId)
            : removeUserId(latest.recentUserIds, userId),
          selfReacted,
        },
      };
    });
    if (isPreview || (!shouldAdd && !shouldRemove)) return;

    try {
      if (shouldAdd) {
        await addMessageReaction(message.conversationId, message.messageId, emoji, userId);
      } else {
        await removeMessageReaction(message.conversationId, message.messageId, emoji, userId);
      }
    } catch {
      addToast('表情回应失败，请重试', 'error');
    }
  };
  const refreshReactions = () => {
    if (isPreview) return;
    refreshMessageReactions(message.conversationId, message.messageId).catch(() => {
      // Reaction detail refresh is opportunistic; the local group remains usable.
    });
  };

  return (
    <div className={containerClass}>
      {!isSelf && (
        <AvatarWithPresence
          name={senderProfile.nickname}
          url={senderProfile.avatarUrl}
          presenceLabel={presenceLabel}
          presenceTone={presenceTone}
          onClick={openSenderProfile}
        />
      )}
      <div className={styles.stack}>
        {!isSelf && (
          <div className={styles.senderMeta}>
            <span>{getMessageSenderLabel(message.senderId)}</span>
            <time>{messageTime}</time>
          </div>
        )}
        <div
          className={`${styles.bubble} ${isSelf ? styles.bubbleSelf : styles.bubbleOther}`}
        >
          {message.replyTo && (
            <button
              type="button"
              className={styles.replyQuote}
              aria-label={`查看被回复的消息：${message.replyTo.contentPreview || '消息'}`}
              disabled={replyHydrating}
              onClick={handleHydrateReply}
            >
              <span>回复</span>
              <strong>{replyHydrating ? '加载中...' : hydratedReplyPreview || message.replyTo.contentPreview}</strong>
            </button>
          )}
          {renderBody(content, searchQuery)}
        </div>
        {reactionGroups.length > 0 && (
          <div className={`${styles.reactions} ${isSelf ? styles.reactionsSelf : ''}`}>
            {reactionGroups.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                className={`${styles.reaction} ${reaction.selfReacted ? styles.reactionActive : ''}`}
                aria-label={`${reaction.emoji} 表情回应，${reaction.count} 次`}
                onFocus={refreshReactions}
                onMouseEnter={refreshReactions}
                onClick={() => toggleReaction(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <strong>{reaction.count}</strong>
              </button>
            ))}
          </div>
        )}
        <div className={`${styles.messageMeta} ${isSelf ? styles.metaSelf : ''}`}>
          {isSelf && <time>{messageTime}</time>}
          {isSelf && deliveryState === 'failed' ? (
            <button
              type="button"
              className={styles.retryButton}
              aria-label="重试发送消息"
              onClick={handleRetry}
            >
              发送失败，点击重试
            </button>
          ) : (
            isSelf && <MessageStatusIndicator status={message.status} deliveryState={deliveryState} />
          )}
        </div>
        {reactionTrayOpen && (
          <div className={`${styles.reactionTray} ${isSelf ? styles.reactionTraySelf : ''}`}>
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                aria-label={`用 ${emoji} 回应`}
                onClick={() => addReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className={`${styles.actions} ${isSelf ? styles.actionsSelf : ''}`}>
          <IconButton
            icon="smile"
            label="添加表情回应"
            active={reactionTrayOpen}
            className={styles.actionBtn}
            onClick={() => setReactionTrayOpen((open) => !open)}
          />
          <IconButton
            icon="reply"
            label="回复消息"
            className={styles.actionBtn}
            onClick={() => setReplyTarget({
              messageId: message.messageId,
              senderId: message.senderId,
              preview: getMessageTextPreview(message),
            })}
          />
          <IconButton icon="copy" label="复制消息" className={styles.actionBtn} onClick={handleCopy} />
          <IconButton icon="forward" label="转发消息" className={styles.actionBtn} />
          <IconButton
            icon="pin"
            label={locallyPinned ? '取消置顶消息' : '置顶消息'}
            active={locallyPinned}
            className={styles.actionBtn}
            onClick={handleTogglePin}
          />
          <IconButton
            icon="trash"
            label="删除消息"
            variant="danger"
            className={styles.actionBtn}
            onClick={handleDelete}
          />
          {isSelf && (
            <IconButton
              icon="rotate-ccw"
              label="撤回消息"
              className={styles.actionBtn}
              onClick={handleRecall}
            />
          )}
        </div>
      </div>
      {isSelf && (
        <AvatarWithPresence
          name={senderProfile.nickname}
          url={senderProfile.avatarUrl}
          presenceLabel={presenceLabel}
          presenceTone={presenceTone}
          onClick={openSenderProfile}
        />
      )}
    </div>
  );
}

function AvatarWithPresence({
  name,
  url,
  presenceLabel,
  presenceTone,
  onClick,
}: {
  name: string;
  url: string;
  presenceLabel: string;
  presenceTone: string;
  onClick: () => void;
}) {
  return (
    <div className={styles.avatarSlot}>
      <div className={styles.avatarFrame}>
        <Avatar
          name={name}
          url={url || undefined}
          size={34}
          ariaLabel={`查看 ${name} 的资料`}
          onClick={onClick}
        />
        <span
          className={`${styles.presenceDot} ${styles[presenceTone]}`}
          aria-label={`${name} 当前状态：${presenceLabel}`}
        />
      </div>
    </div>
  );
}

function getCurrentReaction(
  base: ReactionGroup[],
  overrides: Record<string, ReactionGroup>,
  emoji: string,
): ReactionGroup | undefined {
  return mergeReactionGroups(base, Object.values(overrides)).find((reaction) => reaction.emoji === emoji);
}

function mergeReactionGroups(base: ReactionGroup[], overrides: ReactionGroup[]): ReactionGroup[] {
  const merged = new Map<string, ReactionGroup>();

  for (const reaction of base) {
    merged.set(reaction.emoji, reaction);
  }

  for (const reaction of overrides) {
    merged.set(reaction.emoji, reaction);
  }

  return [...merged.values()].filter((reaction) => reaction.count > 0);
}

function addUserId(userIds: string[], userId: string | null): string[] {
  if (!userId) return userIds;
  return [...new Set([...userIds, userId])];
}

function removeUserId(userIds: string[], userId: string | null): string[] {
  if (!userId) return userIds;
  return userIds.filter((id) => id !== userId);
}

function getDeliveryState(message: Message): DeliveryState {
  if (message.clientMsgId.startsWith('local-pending')) return 'sending';
  if (message.clientMsgId.startsWith('local-failed')) return 'failed';
  return 'sent';
}

function renderBody(content: MessageContent | undefined, searchQuery: string): React.ReactElement {
  const body = content?.body;

  if (!body || body.oneofKind === undefined) {
    return <TextBubble text="[未知消息类型]" />;
  }

  switch (body.oneofKind) {
    case 'text':
      return <TextBubble text={body.text.text} highlight={searchQuery} />;
    case 'image':
      return (
        <ImageBubble
          fileId={body.image.fileId}
          width={body.image.width}
          height={body.image.height}
          thumbnailUrl={body.image.thumbnailUrl}
        />
      );
    case 'file':
      return (
        <FileBubble
          fileId={body.file.fileId}
          fileName={body.file.fileName}
          fileSize={body.file.fileSize}
        />
      );
    case 'audio':
      return (
        <AudioBubble
          fileId={body.audio.fileId}
          durationSec={body.audio.durationSec}
        />
      );
    case 'video':
      return (
        <VideoBubble
          fileId={body.video.fileId}
          durationSec={body.video.durationSec}
          thumbnailUrl={body.video.thumbnailUrl}
        />
      );
    case 'location':
      return (
        <LocationBubble
          latitude={body.location.latitude}
          longitude={body.location.longitude}
          name={body.location.name}
          address={body.location.address}
        />
      );
    case 'sticker':
      return <TextBubble text={`[贴纸: ${body.sticker.stickerId}]`} />;
    case 'notice':
      return <TextBubble text={body.notice.text || '[系统通知]'} />;
    default:
      return <TextBubble text="[未知消息类型]" />;
  }
}
