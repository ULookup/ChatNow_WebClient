import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './LoginForm.module.css';

interface Props { onSuccess: () => void; }

export function RegisterForm({ onSuccess }: Props) {
  const { register } = useAuth();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(nickname, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      <input className={styles.input} type="text" placeholder="昵称"
        value={nickname} onChange={e => setNickname(e.target.value)}
        required minLength={3} maxLength={22} />
      <input className={styles.input} type="password" placeholder="密码"
        value={password} onChange={e => setPassword(e.target.value)}
        required minLength={6} maxLength={15} />
      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
