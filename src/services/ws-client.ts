import { NotifyMessage, NotifyType } from '@/proto/push/notify';
import { PresenceState } from '@/proto/presence/presence_service';
import { getAccessToken, getDeviceId, getTokenHints } from '@/utils/token';
import { websocketUrl } from './endpoints';
import { ensureFreshAccessToken } from './client';
import { useChatStore } from '@/stores/chatStore';
import { useContactStore } from '@/stores/contactStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';

/** Narrow Uint8Array for WebSocket.send() compatibility */
function toWSSend(data: Uint8Array): Blob {
  return data as unknown as Blob;
}

/** Map NotifyPresenceChange string state to PresenceState enum */
function toPresenceState(state: string): PresenceState {
  switch (state) {
    case 'ONLINE': return PresenceState.ONLINE;
    case 'AWAY': return PresenceState.AWAY;
    case 'BUSY': return PresenceState.BUSY;
    case 'OFFLINE': return PresenceState.OFFLINE;
    case 'INVISIBLE': return PresenceState.INVISIBLE;
    default: return PresenceState.PRESENCE_UNSPECIFIED;
  }
}

class WSClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private stopped = true;
  private deviceId = '';
  private connecting = false;
  private generation = 0;

  async connect() {
    if (this.connecting || (this.ws && this.ws.readyState < WebSocket.CLOSING)) return;
    this.stopped = false;
    this.connecting = true;
    const generation = ++this.generation;
    try {
      const valid = await ensureFreshAccessToken();
      if (this.stopped || generation !== this.generation) return;
      if (!valid) { useAuthStore.getState().clearAuth(); return; }
      this.openConnection();
    } catch {
      if (!this.stopped && generation === this.generation) this.scheduleReconnect();
    } finally {
      if (generation === this.generation) this.connecting = false;
    }
  }

  private openConnection() {
    if (this.ws && this.ws.readyState < WebSocket.CLOSING) return;
    const token = getAccessToken();
    if (!token) return;
    this.stopped = false;
    this.deviceId = getTokenHints(token).did || getDeviceId();
    this.ws = new WebSocket(websocketUrl());
    const socket = this.ws;
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      if (this.ws !== socket || this.stopped) return;
      this.sendAuth(token);
      this.startHeartbeat();
      this.reconnectDelay = 1000;
      void this.catchUp();
    };

    this.ws.onmessage = (event) => {
      if (this.ws !== socket || this.stopped) return;
      try {
        const buf = new Uint8Array(event.data as ArrayBuffer);
        const msg = NotifyMessage.fromBinary(buf);
        this.handleNotify(msg);
      } catch (err) {
        console.error('WS message deserialize failed:', err);
      }
    };

    this.ws.onerror = () => { /* handled by onclose */ };

    this.ws.onclose = () => {
      if (this.ws !== socket) return;
      this.ws = null;
      this.stopHeartbeat();
      if (!this.stopped) this.scheduleReconnect();
    };
  }

  private sendAuth(token: string) {
    const deviceId = this.deviceId;
    const msg: NotifyMessage = {
      notifyType: NotifyType.CLIENT_AUTH,
      notifyRemarks: {
        oneofKind: 'clientAuth',
        clientAuth: { accessToken: token, deviceId },
      },
    } as NotifyMessage;
    this.ws?.send(toWSSend(NotifyMessage.toBinary(msg)));
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const hb: NotifyMessage = {
        notifyType: NotifyType.CLIENT_HEARTBEAT,
        notifyRemarks: {
          oneofKind: 'heartbeat',
          heartbeat: {
            userId: useAuthStore.getState().userId ?? '',
            lastUserSeq: 0n,
          },
        },
      } as NotifyMessage;
      this.ws?.send(toWSSend(NotifyMessage.toBinary(hb)));
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleNotify(msg: NotifyMessage) {
    switch (msg.notifyType) {
      case NotifyType.CHAT_MESSAGE_NOTIFY: {
        const remarks = msg.notifyRemarks;
        if (remarks.oneofKind === 'newMessageInfo') {
          const messageInfo = remarks.newMessageInfo.messageInfo;
          if (messageInfo) {
            useChatStore.getState().handleNewMessage(messageInfo);
          }
          // Send ACK
          this.sendAck(remarks.newMessageInfo);
        }
        break;
      }
      case NotifyType.FRIEND_ADD_APPLY_NOTIFY:
        useContactStore.getState().loadPending();
        break;
      case NotifyType.FRIEND_ADD_PROCESS_NOTIFY:
        useContactStore.getState().loadFriends();
        break;
      case NotifyType.FRIEND_REMOVE_NOTIFY:
        useContactStore.getState().loadFriends();
        break;
      case NotifyType.MESSAGE_RECALLED_NOTIFY: {
        const remarks = msg.notifyRemarks;
        if (remarks.oneofKind === 'messageRecalled') {
          const recalled = remarks.messageRecalled;
          useChatStore.getState().handleMessageRecalled(
            recalled.conversationId,
            recalled.messageId,
          );
        }
        break;
      }
      case NotifyType.PRESENCE_CHANGE_NOTIFY: {
        const remarks = msg.notifyRemarks;
        if (remarks.oneofKind === 'presenceChange') {
          const pc = remarks.presenceChange;
          if (pc?.userId) {
            usePresenceStore.getState().updatePresence(pc.userId, {
              userId: pc.userId,
              aggregatedState: toPresenceState(pc.state),
              lastActiveAtMs: 0n,
              devices: [],
            });
          }
        }
        break;
      }
      case NotifyType.KICKED_BY_NEW_DEVICE:
      case NotifyType.KICKED_BY_REVOKE:
      case NotifyType.FORCE_LOGOUT:
        useAuthStore.getState().clearAuth();
        this.disconnect();
        break;
      case NotifyType.CONVERSATION_CREATE_NOTIFY:
        useChatStore.getState().loadConversations();
        break;
      case NotifyType.CONVERSATION_DISMISSED_NOTIFY:
        useChatStore.getState().loadConversations();
        break;
    }
  }

  private sendAck(data: { messageInfo?: { messageId: bigint; userSeq: bigint; conversationId: string; seqId: bigint } }) {
    if (!data.messageInfo) return;
    const ack: NotifyMessage = {
      notifyType: NotifyType.MSG_PUSH_ACK,
      notifyRemarks: {
        oneofKind: 'msgPushAck',
        msgPushAck: {
          userId: useAuthStore.getState().userId ?? '',
          deviceId: this.deviceId,
          messageId: data.messageInfo?.messageId ?? 0n,
          userSeq: data.messageInfo?.userSeq ?? 0n,
          conversationId: data.messageInfo?.conversationId ?? '',
          seqId: data.messageInfo.seqId,
        },
      },
    } as NotifyMessage;
    this.ws?.send(toWSSend(NotifyMessage.toBinary(ack)));
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }, this.reconnectDelay);
  }

  private async catchUp() {
    const state = useChatStore.getState();
    const conversations = Object.entries(state.messagesByConv);
    await Promise.allSettled([
      state.loadConversations(),
      ...conversations.map(([id, messages]) => {
        const last = messages.reduce((seq, message) => message.seqId > seq ? message.seqId : seq, 0n);
        return state.syncMessages(id, Number(last));
      }),
    ]);
  }

  disconnect() {
    this.generation++;
    this.connecting = false;
    this.stopped = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const socket = this.ws;
    this.ws = null;
    socket?.close();
  }
}

export const wsClient = new WSClient();
