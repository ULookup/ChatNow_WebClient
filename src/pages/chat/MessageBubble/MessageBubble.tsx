import type { Message, MessageContent } from '@/proto/message/message_types';
import { MessageStatus } from '@/proto/message/message_types';
import { useAuthStore } from '@/stores/authStore';
import { TextBubble } from './TextBubble';
import { ImageBubble } from './ImageBubble';
import { FileBubble } from './FileBubble';
import { AudioBubble } from './AudioBubble';
import { VideoBubble } from './VideoBubble';
import { LocationBubble } from './LocationBubble';
import styles from './MessageBubble.module.css';

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const userId = useAuthStore((s) => s.userId);
  const isSelf = message.senderId === userId;
  const isRecalled = message.status === MessageStatus.RECALLED;
  const isDeleted = message.status === MessageStatus.DELETED;
  const containerClass = `${styles.container} ${isSelf ? styles.self : styles.other}`;

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

  return (
    <div className={containerClass}>
      <div
        className={`${styles.bubble} ${isSelf ? styles.bubbleSelf : styles.bubbleOther}`}
      >
        {renderBody(content)}
      </div>
    </div>
  );
}

function renderBody(content: MessageContent | undefined): React.ReactElement {
  const body = content?.body;

  if (!body || body.oneofKind === undefined) {
    return <TextBubble text="[未知消息类型]" />;
  }

  switch (body.oneofKind) {
    case 'text':
      return <TextBubble text={body.text.text} />;
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
