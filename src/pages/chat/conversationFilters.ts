import type { Conversation } from '@/proto/conversation/conversation_service';

export function filterConversations(conversations: Conversation[], query: string): Conversation[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return conversations;

  return conversations.filter((conversation) => {
    const searchableText = [
      conversation.name,
      conversation.description,
      conversation.self?.draft,
      conversation.lastMessage?.contentPreview,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
