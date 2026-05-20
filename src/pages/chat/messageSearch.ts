import type { Message } from '@/proto/message/message_types';
import { getMessageTextPreview } from './messageComposer';

export interface MessageSearchResults {
  matches: Message[];
  count: number;
  query: string;
}

export function getMessageSearchResults(messages: Message[], query: string): MessageSearchResults {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return { matches: messages, count: 0, query: '' };
  }

  const matches = messages.filter((message) =>
    getMessageTextPreview(message, 500).toLocaleLowerCase().includes(normalizedQuery),
  );

  return { matches, count: matches.length, query: normalizedQuery };
}
