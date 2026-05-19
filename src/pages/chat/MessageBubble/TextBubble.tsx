interface Props { text: string; }

export function TextBubble({ text }: Props) {
  return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
}
