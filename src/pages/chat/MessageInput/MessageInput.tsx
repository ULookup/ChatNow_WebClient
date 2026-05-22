import { useEffect, useState, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { MessageType, type MessageContent, type ReplyRef } from '@/proto/message/message_types';
import { IconButton } from '@/components/Icon/Icon';
import { uploadChatFile } from '@/services/mediaUpload';
import { createLocalFileMessage, createLocalTextMessage } from '../messageComposer';
import { EmojiPicker } from './EmojiPicker';
import styles from './MessageInput.module.css';

const EMOJI_LIST = ['😀','😂','❤️','👍','🔥','🎉','😢','😡','👏','🙏','💪','🤔'];
const MAX_SINGLE_UPLOAD_SIZE = 100 * 1024 * 1024;

export function MessageInput() {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const activeId = useChatStore(s => s.activeConversationId);
  const activeDraft = useChatStore(s =>
    s.conversations.find(c => c.conversationId === s.activeConversationId)?.self?.draft ?? '',
  );
  const sendMessage = useChatStore(s => s.sendMessage);
  const sendTyping = useChatStore(s => s.sendTyping);
  const saveDraft = useChatStore(s => s.saveDraft);
  const handleNewMessage = useChatStore(s => s.handleNewMessage);
  const userId = useAuthStore(s => s.userId);
  const replyTarget = useUIStore(s => s.replyTarget);
  const clearReplyTarget = useUIStore(s => s.clearReplyTarget);
  const composerFocusRequest = useUIStore(s => s.composerFocusRequest);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingStateRef = useRef(false);
  const typingIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDraftRef = useRef('');
  const lastConversationRef = useRef<string | null>(null);

  useEffect(() => {
    if (composerFocusRequest > 0) {
      editorRef.current?.focus();
    }
  }, [composerFocusRequest]);

  useEffect(() => () => {
    if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
  }, []);

  useEffect(() => {
    if (!editorRef.current || !activeId) return;
    const currentText = editorRef.current.textContent ?? '';
    const switchedConversation = lastConversationRef.current !== activeId;
    const shouldHydrateLateDraft = !currentText && !!activeDraft && !lastDraftRef.current;
    if (switchedConversation || shouldHydrateLateDraft) {
      editorRef.current.textContent = activeDraft;
      lastDraftRef.current = activeDraft;
      lastConversationRef.current = activeId;
    }
  }, [activeId, activeDraft]);

  const publishTyping = (isTyping: boolean) => {
    if (!activeId || isPreview || typingStateRef.current === isTyping) return;
    typingStateRef.current = isTyping;
    sendTyping(activeId, isTyping).catch(() => {
      typingStateRef.current = !isTyping;
    });
  };

  const scheduleTypingIdle = () => {
    if (typingIdleTimerRef.current) clearTimeout(typingIdleTimerRef.current);
    typingIdleTimerRef.current = setTimeout(() => {
      publishTyping(false);
    }, 2500);
  };

  const scheduleDraftSave = (draft: string) => {
    if (!activeId || isPreview || draft === lastDraftRef.current) return;
    if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      const conversationId = activeId;
      lastDraftRef.current = draft;
      saveDraft(conversationId, draft).catch(() => {
        lastDraftRef.current = '';
      });
    }, 350);
  };

  const handleInput = () => {
    const rawText = editorRef.current?.textContent ?? '';
    const text = rawText.trim();
    if (text) {
      publishTyping(true);
      scheduleTypingIdle();
    } else {
      publishTyping(false);
    }
    scheduleDraftSave(rawText);
  };

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
        await sendMessage(activeId, content, buildReplyRef());
      }
      if (editorRef.current) editorRef.current.textContent = '';
      if (!isPreview) {
        if (draftSaveTimerRef.current) clearTimeout(draftSaveTimerRef.current);
        lastDraftRef.current = '';
        saveDraft(activeId, '').catch(() => undefined);
      }
      publishTyping(false);
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
    handleInput();
    setShowEmoji(false);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !activeId || uploading) return;
    if (file.size > MAX_SINGLE_UPLOAD_SIZE) {
      setUploadError('文件超过 100MB');
      return;
    }

    setUploadError('');
    setUploading(true);
    try {
      const mimeType = file.type || 'application/octet-stream';
      if (isPreview && userId) {
        handleNewMessage(createLocalFileMessage({
          conversationId: activeId,
          senderId: userId,
          fileId: `preview-file-${Date.now()}`,
          fileName: file.name,
          fileSize: BigInt(file.size),
          mimeType,
          replyTo: replyTarget,
        }));
      } else {
        const fileInfo = await uploadChatFile(file);
        const content: MessageContent = {
          type: MessageType.FILE,
          body: {
            oneofKind: 'file',
            file: {
              fileId: fileInfo.fileId,
              fileName: fileInfo.fileName,
              fileSize: fileInfo.fileSize,
              mimeType: fileInfo.mimeType,
            },
          },
        };
        await sendMessage(activeId, content, buildReplyRef());
      }
      clearReplyTarget();
    } catch {
      setUploadError('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const buildReplyRef = (): ReplyRef | undefined => (
    replyTarget
      ? {
          repliedMessageId: replyTarget.messageId,
          repliedSenderId: replyTarget.senderId,
          repliedMessageType: MessageType.TEXT,
          contentPreview: replyTarget.preview,
          isRecalled: false,
        }
      : undefined
  );

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
          label={uploading ? '附件上传中' : '选择附件'}
          className={styles.toolBtn}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        />
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          aria-label="选择附件文件"
          onChange={handleFileChange}
        />
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          onInput={handleInput}
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
      {(uploading || uploadError) && (
        <div className={`${styles.uploadHint} ${uploadError ? styles.uploadError : ''}`}>
          {uploadError || '附件上传中...'}
        </div>
      )}
      {showEmoji && <EmojiPicker emojis={EMOJI_LIST} onSelect={insertEmoji} />}
    </div>
  );
}
