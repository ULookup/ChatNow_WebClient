import { useMemo, useState } from 'react';
import type { Message, MessageContent, ReactionGroup } from '@/proto/message/message_types';
import { MessageStatus } from '@/proto/message/message_types';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
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
  const userId = useAuthStore((s) => s.userId);
  const setReplyTarget = useUIStore((s) => s.setReplyTarget);
  const openRightPanel = useUIStore((s) => s.openRightPanel);
  const setSelectedUserProfile = useUIStore((s) => s.setSelectedUserProfile);
  const addToast = useUIStore((s) => s.addToast);
  const isSelf = message.senderId === userId;
  const deliveryState = getDeliveryState(message);
  const isRecalled = message.status === MessageStatus.RECALLED;
  const isDeleted = message.status === MessageStatus.DELETED;
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
  const addReaction = (emoji: string) => {
    setReactionOverrides((overrides) => {
      const current = getCurrentReaction(message.reactions, overrides, emoji);
      if (current?.selfReacted) return overrides;

      return {
        ...overrides,
        [emoji]: {
          emoji,
          count: (current?.count ?? 0) + 1,
          recentUserIds: addUserId(current?.recentUserIds ?? [], userId),
          selfReacted: true,
        },
      };
    });
    setReactionTrayOpen(false);
  };
  const toggleReaction = (emoji: string) => {
    setReactionOverrides((overrides) => {
      const current = getCurrentReaction(message.reactions, overrides, emoji);
      if (!current) return overrides;

      const selfReacted = !current.selfReacted;
      const count = current.count + (selfReacted ? 1 : -1);
      return {
        ...overrides,
        [emoji]: {
          ...current,
          count,
          recentUserIds: selfReacted
            ? addUserId(current.recentUserIds, userId)
            : removeUserId(current.recentUserIds, userId),
          selfReacted,
        },
      };
    });
  };

  return (
    <div className={containerClass}>
      {!isSelf && (
        <div className={styles.avatarSlot}>
          <Avatar
            name={senderProfile.nickname}
            url={senderProfile.avatarUrl || undefined}
            size={34}
            ariaLabel={`查看 ${senderProfile.nickname} 的资料`}
            onClick={openSenderProfile}
          />
        </div>
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
            <div className={styles.replyQuote}>
              <span>回复</span>
              <strong>{message.replyTo.contentPreview}</strong>
            </div>
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
          {isSelf && <MessageStatusIndicator status={message.status} deliveryState={deliveryState} />}
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
          {isSelf && <IconButton icon="rotate-ccw" label="撤回消息" className={styles.actionBtn} />}
        </div>
      </div>
      {isSelf && (
        <div className={styles.avatarSlot}>
          <Avatar
            name={senderProfile.nickname}
            url={senderProfile.avatarUrl || undefined}
            size={34}
            ariaLabel={`查看 ${senderProfile.nickname} 的资料`}
            onClick={openSenderProfile}
          />
        </div>
      )}
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
