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
