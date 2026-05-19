import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, crypto.randomUUID(), 'Web Browser');
    } catch (err: any) {
      setError(err.message ?? '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      <input
        className={styles.input}
        type="text"
        placeholder="用户名"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        minLength={3}
        maxLength={22}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="密码"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        maxLength={15}
      />
      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
