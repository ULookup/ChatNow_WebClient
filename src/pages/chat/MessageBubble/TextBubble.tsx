import styles from './MessageBubble.module.css';

interface Props {
  text: string;
  highlight?: string;
}

export function TextBubble({ text, highlight = '' }: Props) {
  const query = highlight.trim();
  if (!query) return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;

  const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
  if (index === -1) return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;

  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {text.slice(0, index)}
      <mark className={styles.searchMark}>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </span>
  );
}
