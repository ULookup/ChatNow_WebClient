import { MessageStatus } from '@/proto/message/message_types';
import styles from './MessageBubble.module.css';

export type DeliveryState = 'sending' | 'sent' | 'failed';

interface Props {
  status: MessageStatus;
  deliveryState?: DeliveryState;
}

export function MessageStatusIndicator({ status, deliveryState = 'sent' }: Props) {
  if (deliveryState === 'sending') {
    return <span className={styles.statusSending}>发送中...</span>;
  }

  if (deliveryState === 'failed') {
    return <span className={styles.statusFailed}>发送失败，点击重试</span>;
  }

  if (status === MessageStatus.NORMAL) {
    return <span className={styles.statusSent}>已发送</span>;
  }

  return null;
}
