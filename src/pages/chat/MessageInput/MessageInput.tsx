import { useState, useRef, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { MessageType } from '@/proto/message/message_types';
import { IconButton } from '@/components/Icon/Icon';
import { createLocalTextMessage } from '../messageComposer';
import { EmojiPicker } from './EmojiPicker';
import styles from './MessageInput.module.css';

const EMOJI_LIST = ['😀','😂','❤️','👍','🔥','🎉','😢','😡','👏','🙏','💪','🤔'];

export function MessageInput() {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const activeId = useChatStore(s => s.activeConversationId);
  const sendMessage = useChatStore(s => s.sendMessage);
  const handleNewMessage = useChatStore(s => s.handleNewMessage);
  const userId = useAuthStore(s => s.userId);
  const replyTarget = useUIStore(s => s.replyTarget);
  const clearReplyTarget = useUIStore(s => s.clearReplyTarget);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = async () => {
    const text = editorRef.current?.textContent?.trim();
    if (!text || !activeId) return;
    try {
      const content = {
        type: MessageType.TEXT,
        body: { oneofKind: 'text' as const, text: { text } },
      };
      if (isPreview && userId) {
        handleNewMessage(createLocalTextMessage({
          conversationId: activeId,
          senderId: userId,
          text,
          replyTo: replyTarget,
        }));
      } else {
        await sendMessage(activeId, content, replyTarget
          ? {
              repliedMessageId: replyTarget.messageId,
              repliedSenderId: replyTarget.senderId,
              repliedMessageType: MessageType.TEXT,
              contentPreview: replyTarget.preview,
              isRecalled: false,
            }
          : undefined);
      }
      if (editorRef.current) editorRef.current.textContent = '';
      clearReplyTarget();
    } catch {
      // send failed - will be handled by error state later
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    editorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    setShowEmoji(false);
  };

  const editorRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.wrapper}>
      {replyTarget && (
        <div className={styles.replyBanner}>
          <div className={styles.replyText}>
            <span>回复</span>
            <strong>{replyTarget.preview}</strong>
          </div>
          <IconButton icon="x" label="取消回复" className={styles.replyClose} onClick={clearReplyTarget} />
        </div>
      )}
      <div className={styles.bar}>
        <IconButton
          icon="smile"
          label={showEmoji ? '关闭表情选择器' : '打开表情选择器'}
          active={showEmoji}
          className={styles.toolBtn}
          onClick={() => setShowEmoji(!showEmoji)}
        />
        <IconButton
          icon="paperclip"
          label="附件上传尚未启用"
          className={styles.toolBtn}
          disabled
        />
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          onKeyDown={handleKeyDown}
          data-placeholder="输入消息..."
        />
        <IconButton
          icon="send"
          label="发送消息"
          variant="primary"
          className={styles.sendBtn}
          onClick={handleSend}
        />
      </div>
      {showEmoji && <EmojiPicker emojis={EMOJI_LIST} onSelect={insertEmoji} />}
    </div>
  );
}
