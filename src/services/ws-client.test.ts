import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotifyMessage, NotifyType } from '@/proto/push/notify';
import { Message } from '@/proto/message/message_types';
import { setTokens } from '@/utils/token';
import { wsClient } from './ws-client';

const state = vi.hoisted(() => ({
  userId: 'alice', clearAuth: vi.fn(), handleNewMessage: vi.fn(),
  loadConversations: vi.fn().mockResolvedValue(undefined),
  syncMessages: vi.fn().mockResolvedValue(undefined),
  messagesByConv: { room: [{ seqId: 12n }] },
}));
vi.mock('@/stores/authStore', () => ({ useAuthStore: { getState: () => state } }));
vi.mock('@/stores/chatStore', () => ({ useChatStore: { getState: () => state } }));

class FakeSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static instances: FakeSocket[] = [];
  readyState = 0;
  binaryType = '';
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: ArrayBuffer }) => void) | null = null;
  onerror: (() => void) | null = null;
  sent: NotifyMessage[] = [];
  constructor(public url: string) { FakeSocket.instances.push(this); }
  send(data: Uint8Array) { this.sent.push(NotifyMessage.fromBinary(data)); }
  open() { this.readyState = 1; this.onopen?.(); }
  close() { this.readyState = 3; this.onclose?.(); }
  receive(message: NotifyMessage) {
    this.onmessage?.({ data: NotifyMessage.toBinary(message).buffer as ArrayBuffer });
  }
}

describe('browser push transport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('WebSocket', FakeSocket);
    FakeSocket.instances = [];
    localStorage.clear();
    vi.clearAllMocks();
    const payload = btoa(JSON.stringify({ sub: 'alice', did: 'browser-device', exp: 9999999999 }));
    setTokens(`header.${payload}.signature`, 'synthetic-refresh');
  });
  afterEach(() => { wsClient.disconnect(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('uses the authenticated device in both auth and a complete delivery ACK', async () => {
    await wsClient.connect();
    const socket = FakeSocket.instances[0];
    socket.open();
    expect(socket.sent[0].notifyRemarks).toMatchObject({ clientAuth: { deviceId: 'browser-device' } });
    socket.receive(NotifyMessage.create({
      notifyType: NotifyType.CHAT_MESSAGE_NOTIFY,
      notifyRemarks: { oneofKind: 'newMessageInfo', newMessageInfo: {
        messageInfo: Message.create({ messageId: 91n, userSeq: 123n, conversationId: 'room', seqId: 13n }),
      } },
    }));
    expect(socket.sent.at(-1)?.notifyRemarks).toMatchObject({ msgPushAck: {
      userId: 'alice', deviceId: 'browser-device', messageId: 91n,
      userSeq: 123n, conversationId: 'room', seqId: 13n,
    } });
  });

  it('does not reconnect after an intentional disconnect', async () => {
    await wsClient.connect();
    FakeSocket.instances[0].open();
    wsClient.disconnect();
    await vi.advanceTimersByTimeAsync(60000);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('does not open duplicate connections and catches up cached conversations', async () => {
    await wsClient.connect();
    await wsClient.connect();
    expect(FakeSocket.instances).toHaveLength(1);
    FakeSocket.instances[0].open();
    await vi.advanceTimersByTimeAsync(0);
    expect(state.syncMessages).toHaveBeenCalledWith('room', 12);
    FakeSocket.instances[0].close();
    await vi.advanceTimersByTimeAsync(1100);
    expect(FakeSocket.instances).toHaveLength(2);
  });

  it('connects a new session while a previous connection attempt is finishing', async () => {
    const previous = wsClient.connect();
    wsClient.disconnect();
    await wsClient.connect();
    await previous;
    expect(FakeSocket.instances).toHaveLength(1);
  });
});
