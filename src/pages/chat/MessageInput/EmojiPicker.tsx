import styles from './EmojiPicker.module.css';

interface Props { emojis: string[]; onSelect: (e: string) => void; }

export function EmojiPicker({ emojis, onSelect }: Props) {
  return (
    <div className={styles.picker}>
      {emojis.map(e => (
        <button key={e} className={styles.emoji} onClick={() => onSelect(e)}>{e}</button>
      ))}
    </div>
  );
}
