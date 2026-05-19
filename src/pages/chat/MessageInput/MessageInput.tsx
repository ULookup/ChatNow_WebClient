import { useState, useRef, type KeyboardEvent } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageType } from '@/proto/message/message_types';
import { EmojiPicker } from './EmojiPicker';
import styles from './MessageInput.module.css';

const EMOJI_LIST = ['😀','😂','❤️','👍','🔥','🎉','😢','😡','👏','🙏','💪','🤔'];

export function MessageInput() {
  const activeId = useChatStore(s => s.activeConversationId);
  const sendMessage = useChatStore(s => s.sendMessage);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleSend = async () => {
    const text = editorRef.current?.textContent?.trim();
    if (!text || !activeId) return;
    try {
      await sendMessage(activeId, {
        type: MessageType.TEXT,
        body: { oneofKind: 'text' as const, text: { text } },
      });
      if (editorRef.current) editorRef.current.textContent = '';
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
      <div className={styles.bar}>
        <button className={styles.toolBtn} onClick={() => setShowEmoji(!showEmoji)}>😊</button>
        <button className={styles.toolBtn}>📎</button>
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          onKeyDown={handleKeyDown}
          data-placeholder="输入消息..."
        />
        <button className={styles.sendBtn} onClick={handleSend}>📤</button>
      </div>
      {showEmoji && <EmojiPicker emojis={EMOJI_LIST} onSelect={insertEmoji} />}
    </div>
  );
}
