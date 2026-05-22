const PREVIEW_SENDER_NAMES: Record<string, string> = {
  'preview-user': 'Preview',
  'u-2': 'Designer',
  'u-3': 'PM',
  'u-4': 'Reviewer',
};

export function formatMessageClock(createdAtMs: bigint): string {
  const date = new Date(Number(createdAtMs));
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getMessageSenderLabel(senderId: string): string {
  return PREVIEW_SENDER_NAMES[senderId] ?? senderId;
}

export function getMessageSenderProfile(senderId: string) {
  const nickname = getMessageSenderLabel(senderId);

  return {
    userId: senderId,
    nickname,
    avatarUrl: '',
    bio: getPreviewBio(senderId),
  };
}

function getPreviewBio(senderId: string): string {
  switch (senderId) {
    case 'preview-user':
      return '本地预览账号';
    case 'u-2':
      return '界面与动效设计';
    case 'u-3':
      return '产品节奏与体验验收';
    case 'u-4':
      return '评审与可用性反馈';
    default:
      return '';
  }
}
