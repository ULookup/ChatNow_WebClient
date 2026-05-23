import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import styles from './LoginForm.module.css';

interface Props { onSuccess: () => void; }

export function RegisterForm({ onSuccess }: Props) {
  const { register, registerWithPhoneCode, sendPhoneVerifyCode } = useAuth();
  const [mode, setMode] = useState<'password' | 'phoneCode'>('password');
  const [account, setAccount] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyCodeId, setVerifyCodeId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'phoneCode') {
        if (!verifyCodeId) throw new Error('请先获取验证码');
        await registerWithPhoneCode(phone, verifyCodeId, verifyCode, nickname);
      } else {
        await register(account, password, nickname);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const requestCode = async () => {
    setError('');
    setSendingCode(true);
    try {
      const id = await sendPhoneVerifyCode(phone);
      setVerifyCodeId(id);
    } catch (err: any) {
      setError(err.message ?? '验证码发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.modeSwitch} aria-label="注册方式">
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'password' ? styles.modeButtonActive : ''}`}
          onClick={() => setMode('password')}
        >
          密码注册
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === 'phoneCode' ? styles.modeButtonActive : ''}`}
          onClick={() => setMode('phoneCode')}
        >
          手机验证码注册
        </button>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {mode === 'password' && (
        <input
          aria-label="邮箱 / 手机号 / 用户名"
          className={styles.input}
          type="text"
          placeholder="邮箱 / 手机号 / 用户名"
          value={account}
          onChange={e => setAccount(e.target.value)}
          required
          minLength={3}
          maxLength={64}
        />
      )}
      {mode === 'phoneCode' && (
        <div className={styles.codeRow}>
          <input
            aria-label="手机号"
            className={styles.input}
            type="tel"
            placeholder="手机号"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            minLength={7}
            maxLength={24}
          />
          <button className={styles.secondary} type="button" disabled={sendingCode || !phone.trim()} onClick={requestCode}>
            {sendingCode ? '发送中...' : '获取验证码'}
          </button>
        </div>
      )}
      <input
        aria-label="昵称"
        className={styles.input}
        type="text"
        placeholder="昵称"
        value={nickname}
        onChange={e => setNickname(e.target.value)}
        required
        minLength={2}
        maxLength={22}
      />
      {mode === 'password' ? (
        <input
          aria-label="密码"
          className={styles.input}
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          maxLength={32}
        />
      ) : (
        <input
          aria-label="验证码"
          className={styles.input}
          type="text"
          inputMode="numeric"
          placeholder="验证码"
          value={verifyCode}
          onChange={e => setVerifyCode(e.target.value)}
          required
          minLength={4}
          maxLength={8}
        />
      )}
      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
