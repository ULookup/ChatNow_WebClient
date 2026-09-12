import { getMessageSenderLabel } from './messagePresentation';

export function getTypingLabel(activeId: string | null, typingUserIds: string[]): string | undefined {
  if (typingUserIds.length > 0) {
    if (typingUserIds.length === 1) return `${getMessageSenderLabel(typingUserIds[0])} 正在输入`;
    return `${typingUserIds.slice(0, 2).map(getMessageSenderLabel).join('、')} 等正在输入`;
  }
  return activeId?.startsWith('preview-') ? 'Designer 正在输入' : undefined;
}
