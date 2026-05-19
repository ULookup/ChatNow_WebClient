import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IdentityService } from '@/services/identity';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './ProfileEdit.module.css';

export function ProfileEdit() {
  const { userInfo } = useAuth();
  const [nickname, setNickname] = useState(userInfo?.nickname ?? '');
  const [bio, setBio] = useState(userInfo?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await IdentityService.updateProfile({
        requestId: crypto.randomUUID(),
        nickname,
        bio,
      });
      setMessage('保存成功');
    } catch {
      setMessage('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>个人资料</h2>
      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.avatarRow}>
          <Avatar name={userInfo?.nickname} size={64} />
          <span className={styles.changeAvatar}>更换头像</span>
        </div>
        <label className={styles.label}>昵称</label>
        <input className={styles.input} value={nickname} onChange={e => setNickname(e.target.value)} />
        <label className={styles.label}>签名</label>
        <input className={styles.input} value={bio} onChange={e => setBio(e.target.value)} />
        {message && <div className={styles.message}>{message}</div>}
        <button className={styles.saveBtn} type="submit" disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
