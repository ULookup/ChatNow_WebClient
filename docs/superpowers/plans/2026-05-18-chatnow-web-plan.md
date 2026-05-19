# ChatNow Web 客户端实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的 ChatNow IM Web 客户端，覆盖 Identity、Relationship、Conversation、Transmite、Message、Media、Presence 全部 6 个服务。

**Architecture:** React 18 + TypeScript + Vite，Zustand 状态管理，protobuf-ts 协议通信，CSS Modules 样式（iOS 26 液态玻璃浅色模式），Discord 式四栏布局。

**Tech Stack:** React 18, TypeScript 5, Vite 5, Zustand 4, protobuf-ts, React Router v6, @tanstack/react-virtual, CSS Modules, Vitest, React Testing Library

---

### Task 1: 项目脚手架

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Create: `src/styles/global.css`, `src/styles/liquid-glass.module.css`

- [ ] **Step 1: 初始化 Vite + React + TypeScript 项目**

```bash
cd /home/icepop/ChatNow-WebClient
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 安装所有依赖**

```bash
npm install zustand react-router-dom @tanstack/react-virtual @bufbuild/protobuf @protobuf-ts/runtime @protobuf-ts/runtime-rpc
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @protobuf-ts/plugin
```

- [ ] **Step 3: 配置 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  css: { modules: { localsConvention: 'camelCase' } },
  resolve: {
    alias: { '@': '/src' },
  },
});
```

- [ ] **Step 4: 配置 tsconfig.json 路径别名**

在 `compilerOptions` 中添加：
```json
"baseUrl": ".",
"paths": { "@/*": ["src/*"] }
```

- [ ] **Step 5: 创建 CSS 变量基础文件 `src/styles/global.css`**

```css
:root {
  --bg-primary: #e8ecf1;
  --bg-secondary: #f0f2f5;
  --glass-bg-heavy: rgba(255, 255, 255, 0.45);
  --glass-bg-medium: rgba(255, 255, 255, 0.35);
  --glass-bg-light: rgba(255, 255, 255, 0.2);
  --glass-blur-heavy: blur(24px) saturate(140%);
  --glass-blur-medium: blur(28px) saturate(130%);
  --glass-blur-light: blur(32px) saturate(120%);
  --glass-border: 1px solid rgba(0, 0, 0, 0.06);
  --accent: #6366f1;
  --accent-light: rgba(99, 102, 241, 0.12);
  --accent-gradient: linear-gradient(135deg, rgba(99,102,241,0.75), rgba(139,92,246,0.7));
  --text-primary: #222;
  --text-secondary: #555;
  --text-muted: #999;
  --text-inverse: #fff;
  --danger: #ef4444;
  --success: #22c55e;
  --bubble-self-bg: linear-gradient(135deg, rgba(99,102,241,0.75), rgba(139,92,246,0.7));
  --bubble-other-bg: rgba(255, 255, 255, 0.65);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #e8ecf1 0%, #f0f2f5 30%, #f5f6f8 60%, #eaedf2 100%);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 6: 创建液态玻璃 CSS Module `src/styles/liquid-glass.module.css`**

```css
.glassHeavy {
  background: var(--glass-bg-heavy);
  backdrop-filter: var(--glass-blur-heavy);
  -webkit-backdrop-filter: var(--glass-blur-heavy);
  border-right: var(--glass-border);
}
.glassMedium {
  background: var(--glass-bg-medium);
  backdrop-filter: var(--glass-blur-medium);
  -webkit-backdrop-filter: var(--glass-blur-medium);
  border-right: var(--glass-border);
}
.glassLight {
  background: var(--glass-bg-light);
  backdrop-filter: var(--glass-blur-light);
  -webkit-backdrop-filter: var(--glass-blur-light);
}
.glassPanel {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: var(--glass-border);
  border-radius: var(--radius-md);
}
.glassCard {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: var(--glass-border);
  border-radius: var(--radius-md);
}
.glassInput {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 10px 16px;
  outline: none;
  font-size: 13px;
  color: var(--text-primary);
}
.glassInput::placeholder { color: rgba(0, 0, 0, 0.2); }
```

- [ ] **Step 7: 创建入口 `src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 8: 验证项目启动**

```bash
npx vite
```

访问 http://localhost:3000，确认空白页面无报错。

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project with CSS foundation"
```

---

### Task 2: Proto 代码生成

**Files:**
- Create: `scripts/gen-proto.sh`, `src/proto/` (generated)

- [ ] **Step 1: 创建 Proto 生成脚本 `scripts/gen-proto.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
PROTO_DIR="../ChatNow/proto"
OUT_DIR="src/proto"

# Generate for all service proto files
PROTO_FILES=(
  "common/envelope.proto"
  "common/types.proto"
  "identity/identity_service.proto"
  "relationship/relationship_service.proto"
  "conversation/conversation_service.proto"
  "transmite/transmite_service.proto"
  "message/message_types.proto"
  "message/message_service.proto"
  "media/media_service.proto"
  "presence/presence_service.proto"
  "push/notify.proto"
)

for f in "${PROTO_FILES[@]}"; do
  npx protoc \
    --ts_out "$OUT_DIR" \
    --proto_path "$PROTO_DIR" \
    "$PROTO_DIR/$f"
done
echo "Proto generation complete."
```

```bash
chmod +x scripts/gen-proto.sh
```

- [ ] **Step 2: 安装 protoc 并运行生成**

```bash
npm install -D @protobuf-ts/plugin
./scripts/gen-proto.sh
```

- [ ] **Step 3: 验证生成文件**

```bash
ls src/proto/chatnow/
```

确认生成了各服务的 `.ts` 文件（包含 message 类型和 `toBinary`/`fromBinary` 方法）。

- [ ] **Step 4: Commit**

```bash
git add scripts/gen-proto.sh src/proto/
git commit -m "feat: add proto code generation"
```

---

### Task 3: HTTP 客户端 + JWT 管理

**Files:**
- Create: `src/utils/token.ts`, `src/utils/protobuf.ts`, `src/services/client.ts`

- [ ] **Step 1: 创建 Token 工具 `src/utils/token.ts`**

```typescript
const TOKEN_KEY = 'chatnow_access_token';
const REFRESH_KEY = 'chatnow_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}
```

- [ ] **Step 2: 创建 Protobuf 序列化工具 `src/utils/protobuf.ts`**

```typescript
import { BinaryWriter, BinaryReader } from '@protobuf-ts/runtime';

export function serialize<T extends object>(msg: T, type: { toBinary(msg: T, writer?: BinaryWriter): Uint8Array }): Uint8Array {
  return type.toBinary(msg);
}

export function deserialize<T extends object>(bytes: Uint8Array, type: { fromBinary(bytes: Uint8Array, reader?: BinaryReader): T }): T {
  return type.fromBinary(bytes);
}
```

- [ ] **Step 3: 创建 `src/services/client.ts`**

```typescript
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/token';
import { v4 as uuid } from 'uuid';

const BASE_URL = 'http://localhost:9000';

export interface RpcCallOptions {
  path: string;
  auth: 'JWT_REQUIRED' | 'WHITELISTED';
  requestBody: Uint8Array;
  responseType: { fromBinary(bytes: Uint8Array): any };
}

export async function rpcCall<T>(options: RpcCallOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-protobuf',
    'x-trace-id': uuid().replace(/-/g, ''),
  };

  if (options.auth === 'JWT_REQUIRED') {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${options.path}`, {
    method: 'POST',
    headers,
    body: options.requestBody,
  });

  if (!response.ok) {
    // 401 → try refresh token
    if (response.status === 401 && options.auth === 'JWT_REQUIRED') {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryRes = await fetch(`${BASE_URL}${options.path}`, {
          method: 'POST',
          headers,
          body: options.requestBody,
        });
        const retryBuf = new Uint8Array(await retryRes.arrayBuffer());
        return options.responseType.fromBinary(retryBuf);
      }
      clearTokens();
      window.location.hash = '#/login';
      throw new Error('Session expired');
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buf = new Uint8Array(await response.arrayBuffer());
  return options.responseType.fromBinary(buf) as T;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  // will import from generated code
  return false; // placeholder — implemented when IdentityService is ready
}
```

- [ ] **Step 4: 安装 uuid**

```bash
npm install uuid && npm install -D @types/uuid
```

- [ ] **Step 5: Commit**

```bash
git add src/utils/ src/services/client.ts package.json
git commit -m "feat: add HTTP client, JWT token management, protobuf utils"
```

---

### Task 4: authStore + IdentityService

**Files:**
- Create: `src/stores/authStore.ts`, `src/services/identity.ts`

- [ ] **Step 1: 创建 IdentityService `src/services/identity.ts`**

```typescript
import { rpcCall } from './client';
import { RegisterReq, RegisterRsp } from '@/proto/chatnow/identity/identity_service';
import { LoginReq, LoginRsp } from '@/proto/chatnow/identity/identity_service';
import { LogoutReq, LogoutRsp } from '@/proto/chatnow/identity/identity_service';
import { SendVerifyCodeReq, SendVerifyCodeRsp } from '@/proto/chatnow/identity/identity_service';
import { RefreshTokenReq, RefreshTokenRsp } from '@/proto/chatnow/identity/identity_service';
import { GetProfileReq, GetProfileRsp } from '@/proto/chatnow/identity/identity_service';
import { UpdateProfileReq, UpdateProfileRsp } from '@/proto/chatnow/identity/identity_service';
import { SearchUsersReq, SearchUsersRsp } from '@/proto/chatnow/identity/identity_service';
import { GetMultiUserInfoReq, GetMultiUserInfoRsp } from '@/proto/chatnow/identity/identity_service';
import { setTokens } from '@/utils/token';

export const IdentityService = {
  register: (req: RegisterReq) =>
    rpcCall({ path: '/service/identity/register', auth: 'WHITELISTED', requestBody: RegisterReq.toBinary(req), responseType: RegisterRsp }),

  login: (req: LoginReq) =>
    rpcCall({ path: '/service/identity/login', auth: 'WHITELISTED', requestBody: LoginReq.toBinary(req), responseType: LoginRsp }),

  logout: (req: LogoutReq) =>
    rpcCall({ path: '/service/identity/logout', auth: 'JWT_REQUIRED', requestBody: LogoutReq.toBinary(req), responseType: LogoutRsp }),

  sendVerifyCode: (req: SendVerifyCodeReq) =>
    rpcCall({ path: '/service/identity/send_verify_code', auth: 'WHITELISTED', requestBody: SendVerifyCodeReq.toBinary(req), responseType: SendVerifyCodeRsp }),

  refreshToken: (req: RefreshTokenReq) =>
    rpcCall({ path: '/service/identity/refresh_token', auth: 'WHITELISTED', requestBody: RefreshTokenReq.toBinary(req), responseType: RefreshTokenRsp }),

  getProfile: (req: GetProfileReq) =>
    rpcCall({ path: '/service/identity/get_profile', auth: 'JWT_REQUIRED', requestBody: GetProfileReq.toBinary(req), responseType: GetProfileRsp }),

  updateProfile: (req: UpdateProfileReq) =>
    rpcCall({ path: '/service/identity/update_profile', auth: 'JWT_REQUIRED', requestBody: UpdateProfileReq.toBinary(req), responseType: UpdateProfileRsp }),

  searchUsers: (req: SearchUsersReq) =>
    rpcCall({ path: '/service/identity/search_users', auth: 'JWT_REQUIRED', requestBody: SearchUsersReq.toBinary(req), responseType: SearchUsersRsp }),

  getMultiUserInfo: (req: GetMultiUserInfoReq) =>
    rpcCall({ path: '/service/identity/get_multi_info', auth: 'JWT_REQUIRED', requestBody: GetMultiUserInfoReq.toBinary(req), responseType: GetMultiUserInfoRsp }),
};
```

- [ ] **Step 2: 创建 authStore `src/stores/authStore.ts`**

```typescript
import { create } from 'zustand';
import { UserInfo } from '@/proto/chatnow/common/types';
import { IdentityService } from '@/services/identity';
import { setTokens, clearTokens, getAccessToken } from '@/utils/token';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userInfo: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;

  login: (nickname: string, password: string, deviceId: string, deviceName: string) => Promise<void>;
  register: (nickname: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getProfile: (userId?: string) => Promise<UserInfo>;
  setAuth: (tokens: { access_token: string; refresh_token: string }, user: UserInfo) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!getAccessToken(),
  userId: null,
  userInfo: null,
  accessToken: getAccessToken(),
  refreshToken: null,

  setAuth: (tokens, user) => {
    setTokens(tokens.access_token, tokens.refresh_token);
    set({
      isAuthenticated: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId: user.userId,
      userInfo: user,
    });
  },

  clearAuth: () => {
    clearTokens();
    set({ isAuthenticated: false, userId: null, userInfo: null, accessToken: null, refreshToken: null });
  },

  login: async (nickname, password, deviceId, deviceName) => {
    const rsp = await IdentityService.login({
      requestId: crypto.randomUUID(),
      credential: { oneofKind: 'usernamePwd', usernamePwd: { username: nickname, password } },
      deviceId,
      deviceName,
    });
    if (rsp.header?.success) {
      get().setAuth(rsp.tokens!, rsp.userInfo!);
    } else {
      throw new Error(rsp.header?.errorMessage ?? `Login failed: ${rsp.header?.errorCode}`);
    }
  },

  register: async (nickname, password) => {
    const rsp = await IdentityService.register({
      requestId: crypto.randomUUID(),
      credential: { oneofKind: 'usernamePwd', usernamePwd: { username: nickname, password } },
      nickname,
    });
    if (rsp.header?.success) {
      get().setAuth(rsp.tokens!, rsp.userInfo!);
    } else {
      throw new Error(rsp.header?.errorMessage ?? `Register failed: ${rsp.header?.errorCode}`);
    }
  },

  logout: async () => {
    await IdentityService.logout({ requestId: crypto.randomUUID() });
    get().clearAuth();
  },

  refreshAuth: async () => {
    const refresh = get().refreshToken;
    if (!refresh) throw new Error('No refresh token');
    const rsp = await IdentityService.refreshToken({ requestId: crypto.randomUUID(), refreshToken: refresh });
    if (rsp.header?.success && rsp.tokens) {
      setTokens(rsp.tokens.accessToken!, rsp.tokens.refreshToken!);
      set({ accessToken: rsp.tokens.accessToken, refreshToken: rsp.tokens.refreshToken });
    } else {
      get().clearAuth();
      throw new Error('Token refresh failed');
    }
  },

  getProfile: async (userId?) => {
    const rsp = await IdentityService.getProfile({ requestId: crypto.randomUUID(), userId });
    if (rsp.header?.success && rsp.userInfo) {
      if (!userId) set({ userInfo: rsp.userInfo });
      return rsp.userInfo;
    }
    throw new Error(rsp.header?.errorMessage ?? 'Get profile failed');
  },
}));
```

- [ ] **Step 3: 编写 authStore 测试 `src/stores/__tests__/authStore.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      userId: null,
      userInfo: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  it('should initialize as not authenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should set auth tokens and user info', () => {
    const store = useAuthStore.getState();
    store.setAuth(
      { access_token: 'test-access', refresh_token: 'test-refresh' },
      { userId: 'user-1', nickname: 'Test', bio: '', phone: '', avatarUrl: '' }
    );
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().userId).toBe('user-1');
    expect(useAuthStore.getState().accessToken).toBe('test-access');
  });

  it('should clear auth state', () => {
    const store = useAuthStore.getState();
    store.clearAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
```

- [ ] **Step 4: 运行测试**

```bash
npx vitest run src/stores/__tests__/authStore.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/stores/ src/services/identity.ts
git commit -m "feat: add authStore and IdentityService"
```

---

### Task 5: 认证页面 (Login / Register)

**Files:**
- Create: `src/pages/auth/AuthPage.tsx`, `src/pages/auth/AuthPage.module.css`
- Create: `src/pages/auth/LoginForm.tsx`, `src/pages/auth/LoginForm.module.css`
- Create: `src/pages/auth/RegisterForm.tsx`, `src/pages/auth/RegisterForm.module.css`
- Create: `src/hooks/useAuth.ts`
- Create: `src/components/Toast/Toast.tsx`, `src/components/Toast/Toast.module.css`

- [ ] **Step 1: 创建 useAuth hook `src/hooks/useAuth.ts`**

```typescript
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userInfo = useAuthStore(s => s.userInfo);
  const login = useAuthStore(s => s.login);
  const register = useAuthStore(s => s.register);
  const logout = useAuthStore(s => s.logout);

  return { isAuthenticated, userInfo, login, register, logout };
}
```

- [ ] **Step 2: 创建 AuthPage `src/pages/auth/AuthPage.tsx`**

```typescript
import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import styles from './AuthPage.module.css';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/chat" replace />;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>ChatNow</h1>
          <p className={styles.subtitle}>随时随地，即时沟通</p>
        </div>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>
        {mode === 'login' ? <LoginForm /> : <RegisterForm onSuccess={() => setMode('login')} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 AuthPage 样式 `src/pages/auth/AuthPage.module.css`**

```css
.page {
  display: flex; align-items: center; justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e8ecf1, #f5f6f8);
}
.card {
  width: 400px; padding: 40px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}
.header { text-align: center; margin-bottom: 28px; }
.title { font-size: 28px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
.subtitle { font-size: 13px; color: var(--text-muted); }
.tabs { display: flex; gap: 8px; margin-bottom: 24px; background: rgba(0,0,0,0.04); border-radius: 10px; padding: 4px; }
.tab {
  flex: 1; padding: 8px; border: none; background: transparent;
  border-radius: 8px; font-size: 13px; cursor: pointer;
  color: var(--text-muted); transition: all 0.2s;
}
.tabActive {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  color: var(--text-primary); font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
```

- [ ] **Step 4: 创建 LoginForm `src/pages/auth/LoginForm.tsx`**

```typescript
import { useState, FormEvent } from 'react';
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
```

- [ ] **Step 5: 创建 LoginForm 样式 `src/pages/auth/LoginForm.module.css`**

```css
.form { display: flex; flex-direction: column; gap: 14px; }
.input {
  padding: 12px 16px; border-radius: var(--radius-md); border: var(--glass-border);
  background: rgba(255, 255, 255, 0.55); backdrop-filter: blur(12px);
  font-size: 14px; outline: none; color: var(--text-primary);
}
.input::placeholder { color: rgba(0,0,0,0.25); }
.input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-light); }
.submit {
  padding: 12px; border: none; border-radius: var(--radius-md);
  background: var(--accent-gradient);
  backdrop-filter: blur(8px);
  color: var(--text-inverse); font-size: 15px; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s;
}
.submit:disabled { opacity: 0.6; cursor: not-allowed; }
.error {
  padding: 10px 14px; border-radius: var(--radius-sm);
  background: rgba(239, 68, 68, 0.1); color: var(--danger);
  font-size: 13px; border: 1px solid rgba(239, 68, 68, 0.15);
}
```

- [ ] **Step 6: 创建 RegisterForm `src/pages/auth/RegisterForm.tsx`**

```typescript
import { useState, FormEvent } from 'react';
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
```

- [ ] **Step 7: 更新 App.tsx 添加路由**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/auth/AuthPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/auth/ src/hooks/useAuth.ts src/App.tsx
git commit -m "feat: add auth pages with login and register forms"
```

---

### Task 6: uiStore + 主布局 MainLayout

**Files:**
- Create: `src/stores/uiStore.ts`
- Create: `src/layouts/MainLayout.tsx`, `src/layouts/MainLayout.module.css`
- Create: `src/components/NavRail/NavRail.tsx`, `src/components/NavRail/NavRail.module.css`
- Create: `src/components/Avatar/Avatar.tsx`, `src/components/Avatar/Avatar.module.css`

- [ ] **Step 1: 创建 uiStore `src/stores/uiStore.ts`**

```typescript
import { create } from 'zustand';

export type Module = 'chat' | 'contacts' | 'settings';
export type RightPanelType = 'group_info' | 'user_profile' | 'pinned_messages' | null;

interface UIState {
  activeModule: Module;
  rightPanelOpen: boolean;
  rightPanelType: RightPanelType;
  toasts: Array<{ id: string; message: string; type: 'info' | 'error' | 'success' }>;

  switchModule: (m: Module) => void;
  openRightPanel: (type: RightPanelType) => void;
  closeRightPanel: () => void;
  addToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModule: 'chat',
  rightPanelOpen: false,
  rightPanelType: null,
  toasts: [],

  switchModule: (m) => set({ activeModule: m }),

  openRightPanel: (type) => set({ rightPanelOpen: true, rightPanelType: type }),
  closeRightPanel: () => set({ rightPanelOpen: false, rightPanelType: null }),

  addToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
```

- [ ] **Step 2: 创建 Avatar 组件 `src/components/Avatar/Avatar.tsx`**

```typescript
import styles from './Avatar.module.css';

interface Props {
  url?: string;
  name?: string;
  size?: number;
  gradient?: string;
  onClick?: () => void;
}

const GRADIENTS = [
  'linear-gradient(135deg, #a8edea, #fed6e3)',
  'linear-gradient(135deg, #ffd89b, #f7a1a1)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #d4fc79, #96e6a1)',
  'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
];

function hashGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function Avatar({ url, name, size = 36, gradient, onClick }: Props) {
  const bg = gradient || (name ? hashGradient(name) : GRADIENTS[0]);
  return (
    <div
      className={styles.avatar}
      style={{
        width: size, height: size, borderRadius: size > 32 ? 12 : 8,
        background: url ? `url(${url}) center/cover` : bg,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      {!url && name && (
        <span className={styles.initials} style={{ fontSize: size * 0.35 }}>
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建 Avatar 样式 `src/components/Avatar/Avatar.module.css`**

```css
.avatar {
  flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.initials { font-weight: 600; color: rgba(0,0,0,0.45); user-select: none; }
```

- [ ] **Step 4: 创建 NavRail `src/components/NavRail/NavRail.tsx`**

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useUIStore, Module } from '@/stores/uiStore';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './NavRail.module.css';

const NAV_ITEMS: Array<{ module: Module; icon: string; label: string }> = [
  { module: 'chat', icon: '💬', label: '聊天' },
  { module: 'contacts', icon: '👤', label: '联系人' },
  { module: 'settings', icon: '⚙', label: '设置' },
];

export function NavRail() {
  const activeModule = useUIStore(s => s.activeModule);
  const switchModule = useUIStore(s => s.switchModule);
  const { userInfo } = useAuth();

  return (
    <nav className={styles.rail}>
      <div className={styles.topSection}>
        <Avatar
          name={userInfo?.nickname ?? 'U'}
          size={36}
          gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))"
          onClick={() => switchModule('settings')}
        />
      </div>
      <div className={styles.navItems}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.module}
            className={`${styles.navIcon} ${activeModule === item.module ? styles.active : ''}`}
            onClick={() => switchModule(item.module)}
            title={item.label}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 5: 创建 NavRail 样式 `src/components/NavRail/NavRail.module.css`**

```css
.rail {
  width: 64px; display: flex; flex-direction: column; align-items: center;
  padding: 16px 0; gap: 14px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(24px) saturate(140%);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}
.topSection { margin-bottom: 8px; }
.navItems { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
.navIcon {
  width: 40px; height: 40px; border-radius: 12px; border: none;
  background: rgba(0,0,0,0.04); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.navIcon:hover { background: rgba(99, 102, 241, 0.08); }
.active {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.15);
}
```

- [ ] **Step 6: 创建 MainLayout `src/layouts/MainLayout.tsx`**

```typescript
import { ReactNode } from 'react';
import { NavRail } from '@/components/NavRail/NavRail';
import { useUIStore } from '@/stores/uiStore';
import styles from './MainLayout.module.css';

interface Props {
  leftPanel: ReactNode;
  mainContent: ReactNode;
  rightPanel?: ReactNode;
}

export function MainLayout({ leftPanel, mainContent, rightPanel }: Props) {
  const rightPanelOpen = useUIStore(s => s.rightPanelOpen);

  return (
    <div className={styles.layout}>
      <NavRail />
      <div className={styles.leftPanel}>{leftPanel}</div>
      <div className={styles.mainContent}>{mainContent}</div>
      {rightPanelOpen && rightPanel && (
        <div className={styles.rightPanel}>{rightPanel}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: 创建 MainLayout 样式 `src/layouts/MainLayout.module.css`**

```css
.layout {
  display: flex; height: 100vh; overflow: hidden;
}
.leftPanel {
  width: 280px; flex-shrink: 0; display: flex; flex-direction: column;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(28px) saturate(130%);
  -webkit-backdrop-filter: blur(28px) saturate(130%);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}
.mainContent {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(32px) saturate(120%);
  -webkit-backdrop-filter: blur(32px) saturate(120%);
}
.rightPanel {
  width: 240px; flex-shrink: 0;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(24px) saturate(130%);
  -webkit-backdrop-filter: blur(24px) saturate(130%);
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}
```

- [ ] **Step 8: Commit**

```bash
git add src/stores/uiStore.ts src/layouts/ src/components/NavRail/ src/components/Avatar/
git commit -m "feat: add uiStore, MainLayout, NavRail, Avatar components"
```

---

### Task 7: chatStore + Conversation/Transmite/Message Services

**Files:**
- Create: `src/stores/chatStore.ts`
- Create: `src/services/conversation.ts`, `src/services/transmite.ts`, `src/services/message.ts`

- [ ] **Step 1: 创建 ConversationService `src/services/conversation.ts`**

```typescript
import { rpcCall } from './client';
import {
  ListConversationsReq, ListConversationsRsp,
  GetConversationReq, GetConversationRsp,
  CreateConversationReq, CreateConversationRsp,
  SetMuteReq, SetMuteRsp, SetPinReq, SetPinRsp,
  MarkReadReq, MarkReadRsp, SaveDraftReq, SaveDraftRsp,
} from '@/proto/chatnow/conversation/conversation_service';

export const ConversationService = {
  list: (req: ListConversationsReq) =>
    rpcCall({ path: '/service/conversation/list', auth: 'JWT_REQUIRED', requestBody: ListConversationsReq.toBinary(req), responseType: ListConversationsRsp }),

  get: (req: GetConversationReq) =>
    rpcCall({ path: '/service/conversation/get', auth: 'JWT_REQUIRED', requestBody: GetConversationReq.toBinary(req), responseType: GetConversationRsp }),

  create: (req: CreateConversationReq) =>
    rpcCall({ path: '/service/conversation/create', auth: 'JWT_REQUIRED', requestBody: CreateConversationReq.toBinary(req), responseType: CreateConversationRsp }),

  setMute: (req: SetMuteReq) =>
    rpcCall({ path: '/service/conversation/set_mute', auth: 'JWT_REQUIRED', requestBody: SetMuteReq.toBinary(req), responseType: SetMuteRsp }),

  setPin: (req: SetPinReq) =>
    rpcCall({ path: '/service/conversation/set_pin', auth: 'JWT_REQUIRED', requestBody: SetPinReq.toBinary(req), responseType: SetPinRsp }),

  markRead: (req: MarkReadReq) =>
    rpcCall({ path: '/service/conversation/mark_read', auth: 'JWT_REQUIRED', requestBody: MarkReadReq.toBinary(req), responseType: MarkReadRsp }),

  saveDraft: (req: SaveDraftReq) =>
    rpcCall({ path: '/service/conversation/save_draft', auth: 'JWT_REQUIRED', requestBody: SaveDraftReq.toBinary(req), responseType: SaveDraftRsp }),
};
```

- [ ] **Step 2: 创建 TransmiteService `src/services/transmite.ts`**

```typescript
import { rpcCall } from './client';
import { SendMessageReq, SendMessageRsp } from '@/proto/chatnow/transmite/transmite_service';

export const TransmiteService = {
  send: (req: SendMessageReq) =>
    rpcCall({ path: '/service/transmite/send', auth: 'JWT_REQUIRED', requestBody: SendMessageReq.toBinary(req), responseType: SendMessageRsp }),
};
```

- [ ] **Step 3: 创建 MessageService `src/services/message.ts`**

```typescript
import { rpcCall } from './client';
import {
  SyncMessagesReq, SyncMessagesRsp,
  GetHistoryReq, GetHistoryRsp,
  SearchMessagesReq, SearchMessagesRsp,
  RecallMessageReq, RecallMessageRsp,
  AddReactionReq, AddReactionRsp,
  RemoveReactionReq, RemoveReactionRsp,
  PinMessageReq, PinMessageRsp,
  UnpinMessageReq, UnpinMessageRsp,
  ListPinnedReq, ListPinnedRsp,
  DeleteMessagesReq, DeleteMessagesRsp,
} from '@/proto/chatnow/message/message_service';

export const MessageService = {
  sync: (req: SyncMessagesReq) =>
    rpcCall({ path: '/service/message/sync', auth: 'JWT_REQUIRED', requestBody: SyncMessagesReq.toBinary(req), responseType: SyncMessagesRsp }),

  getHistory: (req: GetHistoryReq) =>
    rpcCall({ path: '/service/message/get_history', auth: 'JWT_REQUIRED', requestBody: GetHistoryReq.toBinary(req), responseType: GetHistoryRsp }),

  search: (req: SearchMessagesReq) =>
    rpcCall({ path: '/service/message/search', auth: 'JWT_REQUIRED', requestBody: SearchMessagesReq.toBinary(req), responseType: SearchMessagesRsp }),

  recall: (req: RecallMessageReq) =>
    rpcCall({ path: '/service/message/recall', auth: 'JWT_REQUIRED', requestBody: RecallMessageReq.toBinary(req), responseType: RecallMessageRsp }),

  addReaction: (req: AddReactionReq) =>
    rpcCall({ path: '/service/message/add_reaction', auth: 'JWT_REQUIRED', requestBody: AddReactionReq.toBinary(req), responseType: AddReactionRsp }),

  removeReaction: (req: RemoveReactionReq) =>
    rpcCall({ path: '/service/message/remove_reaction', auth: 'JWT_REQUIRED', requestBody: RemoveReactionReq.toBinary(req), responseType: RemoveReactionRsp }),

  pin: (req: PinMessageReq) =>
    rpcCall({ path: '/service/message/pin', auth: 'JWT_REQUIRED', requestBody: PinMessageReq.toBinary(req), responseType: PinMessageRsp }),

  unpin: (req: UnpinMessageReq) =>
    rpcCall({ path: '/service/message/unpin', auth: 'JWT_REQUIRED', requestBody: UnpinMessageReq.toBinary(req), responseType: UnpinMessageRsp }),

  listPinned: (req: ListPinnedReq) =>
    rpcCall({ path: '/service/message/list_pinned', auth: 'JWT_REQUIRED', requestBody: ListPinnedReq.toBinary(req), responseType: ListPinnedRsp }),

  delete: (req: DeleteMessagesReq) =>
    rpcCall({ path: '/service/message/delete', auth: 'JWT_REQUIRED', requestBody: DeleteMessagesReq.toBinary(req), responseType: DeleteMessagesRsp }),
};
```

- [ ] **Step 4: 创建 chatStore `src/stores/chatStore.ts`**

```typescript
import { create } from 'zustand';
import { Conversation } from '@/proto/chatnow/conversation/conversation_service';
import { Message } from '@/proto/chatnow/message/message_types';
import { MessageContent, MessageType } from '@/proto/chatnow/message/message_types';
import { ConversationService } from '@/services/conversation';
import { TransmiteService } from '@/services/transmite';
import { MessageService } from '@/services/message';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConv: Record<string, Message[]>;
  lastReadSeq: Record<string, number>;
  unreadCounts: Record<string, number>;
  loading: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  openConversation: (convId: string) => Promise<void>;
  sendMessage: (convId: string, content: MessageContent) => Promise<void>;
  loadHistory: (convId: string, beforeSeq: number) => Promise<void>;
  syncMessages: (convId: string, afterSeq: number) => Promise<void>;
  markRead: (convId: string, seq: number) => Promise<void>;
  saveDraft: (convId: string, draft: string) => Promise<void>;
  setPin: (convId: string, pin: boolean) => Promise<void>;
  setMute: (convId: string, mute: boolean) => Promise<void>;

  // WS handlers
  handleNewMessage: (msg: Message) => void;
  handleMessageRecalled: (convId: string, messageId: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConv: {},
  lastReadSeq: {},
  unreadCounts: {},
  loading: false,

  loadConversations: async () => {
    set({ loading: true });
    const rsp = await ConversationService.list({
      requestId: crypto.randomUUID(),
      page: { limit: 50, cursor: '' },
    });
    if (rsp.header?.success) {
      set({ conversations: rsp.conversations ?? [], loading: false });
    }
  },

  openConversation: async (convId) => {
    set({ activeConversationId: convId });
    const conv = get().conversations.find(c => c.conversationId === convId);
    if (conv?.self?.unreadCount) {
      await get().markRead(convId, Number(conv.self.lastReadSeq));
    }
    if (!get().messagesByConv[convId]) {
      await get().syncMessages(convId, 0);
    }
  },

  sendMessage: async (convId, content) => {
    const clientMsgId = crypto.randomUUID();
    const rsp = await TransmiteService.send({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      content,
      clientMsgId,
    });
    if (rsp.header?.success && rsp.message) {
      get().handleNewMessage(rsp.message);
    }
  },

  loadHistory: async (convId, beforeSeq) => {
    const rsp = await MessageService.getHistory({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      beforeSeq: BigInt(beforeSeq),
      limit: 30,
    });
    if (rsp.header?.success && rsp.messages) {
      const existing = get().messagesByConv[convId] ?? [];
      const newMsgs = [...rsp.messages, ...existing];
      set({ messagesByConv: { ...get().messagesByConv, [convId]: newMsgs } });
    }
  },

  syncMessages: async (convId, afterSeq) => {
    const rsp = await MessageService.sync({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      afterSeq: BigInt(afterSeq),
      limit: 50,
    });
    if (rsp.header?.success && rsp.messages) {
      const existing = get().messagesByConv[convId] ?? [];
      const merged = [...existing];
      for (const msg of rsp.messages) {
        if (!merged.find(m => m.messageId === msg.messageId)) {
          merged.push(msg);
        }
      }
      merged.sort((a, b) => Number(a.seqId - b.seqId));
      set({ messagesByConv: { ...get().messagesByConv, [convId]: merged } });
    }
  },

  markRead: async (convId, seq) => {
    await ConversationService.markRead({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      lastReadSeq: BigInt(seq),
    });
  },

  saveDraft: async (convId, draft) => {
    await ConversationService.saveDraft({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      draft,
    });
  },

  setPin: async (convId, pin) => {
    await ConversationService.setPin({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      pin,
    });
  },

  setMute: async (convId, mute) => {
    await ConversationService.setMute({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      mute,
    });
  },

  handleNewMessage: (msg) => {
    const convId = msg.conversationId;
    const existing = get().messagesByConv[convId] ?? [];
    if (!existing.find(m => m.messageId === msg.messageId)) {
      set({
        messagesByConv: { ...get().messagesByConv, [convId]: [...existing, msg] },
      });
    }
  },

  handleMessageRecalled: (convId, messageId) => {
    const msgs = get().messagesByConv[convId] ?? [];
    const updated = msgs.map(m =>
      m.messageId === messageId ? { ...m, status: 1 } : m
    );
    set({ messagesByConv: { ...get().messagesByConv, [convId]: updated } });
  },
}));
```

- [ ] **Step 5: Commit**

```bash
git add src/services/conversation.ts src/services/transmite.ts src/services/message.ts src/stores/chatStore.ts
git commit -m "feat: add chatStore and Conversation/Transmite/Message services"
```

---

### Task 8: 聊天页面 — 会话列表 + 聊天窗口

**Files:**
- Create: `src/pages/chat/ChatPage.tsx`
- Create: `src/pages/chat/ConversationList.tsx`, `src/pages/chat/ConversationList.module.css`
- Create: `src/pages/chat/ConversationItem.tsx`, `src/pages/chat/ConversationItem.module.css`
- Create: `src/pages/chat/ChatWindow.tsx`, `src/pages/chat/ChatWindow.module.css`
- Create: `src/pages/chat/ChatHeader.tsx`, `src/pages/chat/ChatHeader.module.css`

- [ ] **Step 1: 创建 ChatPage `src/pages/chat/ChatPage.tsx`**

```typescript
import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useChatStore } from '@/stores/chatStore';

export function ChatPage() {
  const loadConversations = useChatStore(s => s.loadConversations);
  const activeConvId = useChatStore(s => s.activeConversationId);

  useEffect(() => { loadConversations(); }, []);

  return (
    <MainLayout
      leftPanel={<ConversationList />}
      mainContent={activeConvId ? <ChatWindow /> : <EmptyState />}
    />
  );
}

function EmptyState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 14 }}>
      选择一个会话开始聊天
    </div>
  );
}
```

- [ ] **Step 2: 创建 ConversationList `src/pages/chat/ConversationList.tsx`**

```typescript
import { useChatStore } from '@/stores/chatStore';
import { ConversationItem } from './ConversationItem';
import styles from './ConversationList.module.css';

export function ConversationList() {
  const conversations = useChatStore(s => s.conversations);

  return (
    <div className={styles.panel}>
      <div className={styles.searchBar}>
        <input className={styles.searchInput} type="text" placeholder="🔍 搜索..." />
      </div>
      <div className={styles.list}>
        {conversations.map(conv => (
          <ConversationItem key={conv.conversationId} conv={conv} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建 ConversationList 样式**

```css
.panel { display: flex; flex-direction: column; height: 100%; }
.searchBar { padding: 14px; }
.searchInput {
  width: 100%; padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05);
  background: rgba(0,0,0,0.04); backdrop-filter: blur(12px);
  font-size: 12px; outline: none; color: var(--text-primary);
}
.list { flex: 1; overflow-y: auto; padding: 0 8px; }
```

- [ ] **Step 4: 创建 ConversationItem `src/pages/chat/ConversationItem.tsx`**

```typescript
import { Conversation } from '@/proto/chatnow/conversation/conversation_service';
import { useChatStore } from '@/stores/chatStore';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './ConversationItem.module.css';

interface Props { conv: Conversation; }

export function ConversationItem({ conv }: Props) {
  const activeId = useChatStore(s => s.activeConversationId);
  const openConversation = useChatStore(s => s.openConversation);
  const isActive = conv.conversationId === activeId;
  const unread = Number(conv.self?.unreadCount ?? 0);
  const isMuted = conv.self?.isMuted;

  return (
    <div
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={() => openConversation(conv.conversationId!)}
    >
      <Avatar name={conv.name ?? '?'} gradient={isActive ? undefined : undefined} />
      <div className={styles.info}>
        <div className={styles.name}>
          {conv.name || '未命名会话'}
          {isMuted && <span className={styles.muted}>🔇</span>}
        </div>
        {conv.lastMessage && (
          <div className={styles.preview}>
            {conv.lastMessage.contentPreview || '[消息]'}
          </div>
        )}
      </div>
      <div className={styles.meta}>
        {conv.lastMessage && (
          <span className={styles.time}>{formatTime(Number(conv.lastMessage.sentAtMs))}</span>
        )}
        {unread > 0 && !isMuted && (
          <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>
        )}
      </div>
    </div>
  );
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  if (diffDays === 1) return '昨天';
  return `${d.getMonth()+1}/${d.getDate()}`;
}
```

- [ ] **Step 5: 创建 ConversationItem 样式**

```css
.item {
  display: flex; align-items: center; gap: 10px; padding: 10px 10px;
  border-radius: 14px; margin: 2px 0; cursor: pointer; transition: all 0.15s;
}
.item:hover { background: rgba(0,0,0,0.03); }
.active {
  background: rgba(99, 102, 241, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(99, 102, 241, 0.1);
}
.info { flex: 1; min-width: 0; }
.name { font-size: 12px; font-weight: 500; color: var(--text-primary); display: flex; align-items: center; gap: 4px; }
.preview { font-size: 10px; color: var(--text-muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.time { font-size: 9px; color: var(--text-muted); }
.badge {
  background: rgba(239, 68, 68, 0.12); border-radius: 8px; padding: 2px 7px;
  font-size: 10px; color: var(--danger); font-weight: 600;
  backdrop-filter: blur(6px); border: 1px solid rgba(239, 68, 68, 0.1);
}
.muted { font-size: 10px; }
```

- [ ] **Step 6: 创建 ChatWindow `src/pages/chat/ChatWindow.tsx`**

```typescript
import { useChatStore } from '@/stores/chatStore';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList/MessageList';
import { MessageInput } from './MessageInput/MessageInput';
import styles from './ChatWindow.module.css';

export function ChatWindow() {
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));

  if (!conv) return null;

  return (
    <div className={styles.window}>
      <ChatHeader conv={conv} />
      <MessageList />
      <MessageInput />
    </div>
  );
}
```

- [ ] **Step 7: 创建 ChatHeader `src/pages/chat/ChatHeader.tsx`**

```typescript
import { Conversation } from '@/proto/chatnow/conversation/conversation_service';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './ChatHeader.module.css';

interface Props { conv: Conversation; }

export function ChatHeader({ conv }: Props) {
  return (
    <div className={styles.header}>
      <Avatar name={conv.name ?? '?'} size={32} />
      <div className={styles.name}>{conv.name || '未命名'}</div>
      <div className={styles.actions}>
        <button className={styles.actionBtn}>🔍</button>
        <button className={styles.actionBtn}>📌</button>
      </div>
    </div>
  );
}
```

ChatHeader 样式：
```css
.header {
  display: flex; align-items: center; gap: 10px; padding: 12px 16px;
  background: rgba(255,255,255,0.4); backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(0,0,0,0.05); flex-shrink: 0;
}
.name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.actions { margin-left: auto; display: flex; gap: 4px; }
.actionBtn {
  width: 32px; height: 32px; border: none; border-radius: 8px;
  background: rgba(0,0,0,0.04); cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center;
}
```

ChatWindow 样式：
```css
.window { display: flex; flex-direction: column; height: 100%; }
```

- [ ] **Step 8: Commit**

```bash
git add src/pages/chat/
git commit -m "feat: add ChatPage with conversation list and chat window"
```

---

### Task 9: 消息气泡组件（全部 8 种类型）

**Files:**
- Create: `src/pages/chat/MessageList/MessageList.tsx`, `MessageList.module.css`
- Create: `src/pages/chat/MessageBubble/TextBubble.tsx`
- Create: `src/pages/chat/MessageBubble/ImageBubble.tsx`
- Create: `src/pages/chat/MessageBubble/FileBubble.tsx`
- Create: `src/pages/chat/MessageBubble/AudioBubble.tsx`
- Create: `src/pages/chat/MessageBubble/VideoBubble.tsx`
- Create: `src/pages/chat/MessageBubble/LocationBubble.tsx`
- Create: `src/pages/chat/MessageBubble/MessageBubble.tsx`
- Create: `src/pages/chat/MessageBubble/MessageBubble.module.css`

- [ ] **Step 1: 创建 VirtualMessageList `src/pages/chat/MessageList/MessageList.tsx`**

```typescript
import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useChatStore } from '@/stores/chatStore';
import { MessageBubble } from '../MessageBubble/MessageBubble';
import styles from './MessageList.module.css';

export function MessageList() {
  const activeId = useChatStore(s => s.activeConversationId);
  const messages = useChatStore(s => activeId ? s.messagesByConv[activeId] ?? [] : []);
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  useEffect(() => {
    virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
  }, [messages.length]);

  return (
    <div ref={parentRef} className={styles.list}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(vItem => {
          const msg = messages[vItem.index];
          return (
            <div
              key={msg.messageId?.toString() ?? vItem.key}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                transform: `translateY(${vItem.start}px)`,
              }}
              data-index={vItem.index}
              ref={virtualizer.measureElement}
            >
              <MessageBubble message={msg} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

样式 `MessageList.module.css`：
```css
.list { flex: 1; overflow-y: auto; padding: 16px; }
```

- [ ] **Step 2: 创建 MessageBubble 路由组件 `src/pages/chat/MessageBubble/MessageBubble.tsx`**

```typescript
import { Message } from '@/proto/chatnow/message/message_types';
import { useAuthStore } from '@/stores/authStore';
import { TextBubble } from './TextBubble';
import { ImageBubble } from './ImageBubble';
import { FileBubble } from './FileBubble';
import { AudioBubble } from './AudioBubble';
import { VideoBubble } from './VideoBubble';
import { LocationBubble } from './LocationBubble';
import styles from './MessageBubble.module.css';

interface Props { message: Message; }

export function MessageBubble({ message }: Props) {
  const userId = useAuthStore(s => s.userId);
  const isSelf = message.senderId === userId;
  const isRecalled = message.status === 1;
  const containerClass = `${styles.container} ${isSelf ? styles.self : styles.other}`;

  if (isRecalled) {
    return (
      <div className={containerClass}>
        <div className={styles.recalled}>消息已被撤回</div>
      </div>
    );
  }

  const body = message.content?.body;
  const type = message.content?.type;

  return (
    <div className={containerClass}>
      <div className={`${styles.bubble} ${isSelf ? styles.bubbleSelf : styles.bubbleOther}`}>
        {renderBubble(type?.valueOf() ?? 1, body)}
      </div>
    </div>
  );
}

function renderBubble(type: number, body: any) {
  switch (type) {
    case 1: return <TextBubble text={body.value?.text ?? ''} />;
    case 2: return <ImageBubble fileId={body.value?.fileId} width={body.value?.width} height={body.value?.height} />;
    case 3: return <FileBubble fileId={body.value?.fileId} fileName={body.value?.fileName} fileSize={body.value?.fileSize} />;
    case 4: return <AudioBubble fileId={body.value?.fileId} durationSec={body.value?.durationSec} />;
    case 5: return <VideoBubble fileId={body.value?.fileId} durationSec={body.value?.durationSec} thumbnailUrl={body.value?.thumbnailUrl} />;
    case 6: return <LocationBubble lat={body.value?.latitude} lng={body.value?.longitude} name={body.value?.name} address={body.value?.address} />;
    case 7: return <TextBubble text="[贴纸]" />;
    case 8: return <TextBubble text={body.value?.text ?? '[系统通知]'} />;
    default: return <TextBubble text="[未知消息类型]" />;
  }
}
```

样式 `MessageBubble.module.css`：
```css
.container { display: flex; padding: 2px 0; }
.self { justify-content: flex-end; }
.other { justify-content: flex-start; align-items: flex-end; gap: 8px; }
.bubble {
  max-width: 65%; padding: 10px 14px; font-size: 13px; line-height: 1.5;
  word-break: break-word;
}
.bubbleSelf {
  background: linear-gradient(135deg, rgba(99,102,241,0.75), rgba(139,92,246,0.7));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px 16px 4px 16px; color: #fff;
  box-shadow: 0 2px 6px rgba(99,102,241,0.2);
}
.bubbleOther {
  background: rgba(255,255,255,0.65); backdrop-filter: blur(16px);
  border: 1px solid rgba(0,0,0,0.06); border-radius: 16px 16px 16px 4px;
  color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.recalled { font-size: 11px; color: var(--text-muted); font-style: italic; padding: 4px 0; }
```

- [ ] **Step 3: 创建各 Bubble 组件**

TextBubble:
```typescript
interface Props { text: string; }
export function TextBubble({ text }: Props) {
  return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;
}
```

ImageBubble:
```typescript
interface Props { fileId?: string; width?: number; height?: number; }
export function ImageBubble({ fileId, width, height }: Props) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (fileId) MediaService.applyDownload({ requestId: crypto.randomUUID(), fileId })
      .then(r => { if (r.downloadUrl) setUrl(r.downloadUrl); });
  }, [fileId]);
  if (!url) return <div style={{ width: 200, height: 150, background: 'rgba(0,0,0,0.05)', borderRadius: 8 }} />;
  return <img src={url} style={{ maxWidth: 300, maxHeight: 250, borderRadius: 8 }} alt="" />;
}
```

FileBubble:
```typescript
interface Props { fileId?: string; fileName?: string; fileSize?: number; }
export function FileBubble({ fileName, fileSize }: Props) {
  const sizeStr = fileSize ? (fileSize > 1024*1024 ? `${(fileSize/1024/1024).toFixed(1)}MB` : `${(fileSize/1024).toFixed(0)}KB`) : '';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>📄</span>
      <div style={{ fontSize: 11 }}><div>{fileName ?? '文件'}</div><div style={{ color: 'inherit', opacity: 0.6 }}>{sizeStr}</div></div>
    </div>
  );
}
```

AudioBubble:
```typescript
interface Props { fileId?: string; durationSec?: number; }
export function AudioBubble({ durationSec }: Props) {
  const mins = Math.floor((durationSec ?? 0) / 60);
  const secs = (durationSec ?? 0) % 60;
  return <span>🎤 语音 {mins}:{secs.toString().padStart(2, '0')}</span>;
}
```

VideoBubble:
```typescript
interface Props { fileId?: string; durationSec?: number; thumbnailUrl?: string; }
export function VideoBubble({ durationSec, thumbnailUrl }: Props) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ width: 240, height: 160, background: 'rgba(0,0,0,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 32 }}>▶️</span>
      </div>
      {durationSec && <span style={{ position: 'absolute', bottom: 4, right: 4, fontSize: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '1px 4px', borderRadius: 4 }}>{Math.floor(durationSec/60)}:{String(durationSec%60).padStart(2,'0')}</span>}
    </div>
  );
}
```

LocationBubble:
```typescript
interface Props { lat?: number; lng?: number; name?: string; address?: string; }
export function LocationBubble({ name, address }: Props) {
  return (
    <div style={{ fontSize: 11 }}>
      <div>📍 {name ?? '位置'}</div>
      {address && <div style={{ opacity: 0.6, marginTop: 2 }}>{address}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/chat/MessageList/ src/pages/chat/MessageBubble/
git commit -m "feat: add virtual message list and all 8 message bubble types"
```

---

### Task 10: 消息输入组件

**Files:**
- Create: `src/pages/chat/MessageInput/MessageInput.tsx`, `MessageInput.module.css`
- Create: `src/pages/chat/MessageInput/EmojiPicker.tsx`, `EmojiPicker.module.css`

- [ ] **Step 1: 创建 MessageInput `src/pages/chat/MessageInput/MessageInput.tsx`**

```typescript
import { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MessageType } from '@/proto/chatnow/message/message_types';
import { EmojiPicker } from './EmojiPicker';
import styles from './MessageInput.module.css';

const EMOJI_LIST = ['😀','😂','❤️','👍','🔥','🎉','😢','😡','👏','🙏','💪','🤔'];

export function MessageInput() {
  const activeId = useChatStore(s => s.activeConversationId);
  const sendMessage = useChatStore(s => s.sendMessage);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!text.trim() || !activeId) return;
    await sendMessage(activeId, {
      type: MessageType.TEXT,
      body: { oneofKind: 'text', text: { text: text.trim() } },
    });
    setText('');
    if (inputRef.current) inputRef.current.textContent = '';
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        <button className={styles.toolBtn} onClick={() => setShowEmoji(!showEmoji)}>😊</button>
        <button className={styles.toolBtn}>📎</button>
        <div
          ref={inputRef}
          className={styles.editor}
          contentEditable
          onInput={e => setText(e.currentTarget.textContent ?? '')}
          onKeyDown={handleKeyDown}
          data-placeholder="输入消息..."
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={!text.trim()}>📤</button>
      </div>
      {showEmoji && <EmojiPicker emojis={EMOJI_LIST} onSelect={insertEmoji} />}
    </div>
  );
}
```

样式：
```css
.wrapper { padding: 10px 16px; flex-shrink: 0; }
.bar {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 20px;
  background: rgba(255,255,255,0.55); backdrop-filter: blur(20px);
  border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.toolBtn {
  width: 28px; height: 28px; border: none; border-radius: 6px;
  background: transparent; cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.toolBtn:hover { background: rgba(0,0,0,0.04); }
.editor {
  flex: 1; outline: none; font-size: 13px; color: var(--text-primary);
  max-height: 100px; overflow-y: auto; line-height: 1.4;
}
.editor:empty::before { content: attr(data-placeholder); color: rgba(0,0,0,0.2); }
.sendBtn {
  width: 32px; height: 32px; border: none; border-radius: 50%;
  background: var(--accent-gradient); color: #fff; cursor: pointer;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
}
.sendBtn:disabled { opacity: 0.4; cursor: not-allowed; }
```

- [ ] **Step 2: 创建 EmojiPicker `src/pages/chat/MessageInput/EmojiPicker.tsx`**

```typescript
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
```

样式：
```css
.picker {
  display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; padding: 8px 12px;
  border-radius: 12px; background: rgba(255,255,255,0.55);
  backdrop-filter: blur(16px); border: 1px solid rgba(0,0,0,0.06);
}
.emoji { font-size: 20px; border: none; background: none; cursor: pointer; padding: 4px; border-radius: 6px; }
.emoji:hover { background: rgba(0,0,0,0.06); }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/chat/MessageInput/
git commit -m "feat: add message input with emoji picker"
```

---

### Task 11: 联系人模块

**Files:**
- Create: `src/stores/contactStore.ts`
- Create: `src/services/relationship.ts`
- Create: `src/pages/contacts/ContactsPage.tsx`, `ContactsPage.module.css`
- Create: `src/pages/contacts/FriendList.tsx`
- Create: `src/pages/contacts/PendingRequests.tsx`

- [ ] **Step 1: 创建 RelationshipService `src/services/relationship.ts`**

```typescript
import { rpcCall } from './client';
import {
  ListFriendsReq, ListFriendsRsp,
  SendFriendReq, SendFriendRsp,
  HandleFriendReq, HandleFriendRsp,
  RemoveFriendReq, RemoveFriendRsp,
  BlockUserReq, BlockUserRsp,
  UnblockUserReq, UnblockUserRsp,
  ListBlockedReq, ListBlockedRsp,
  ListPendingReq, ListPendingRsp,
} from '@/proto/chatnow/relationship/relationship_service';

export const RelationshipService = {
  listFriends: (req: ListFriendsReq) =>
    rpcCall({ path: '/service/relationship/list_friends', auth: 'JWT_REQUIRED', requestBody: ListFriendsReq.toBinary(req), responseType: ListFriendsRsp }),

  sendRequest: (req: SendFriendReq) =>
    rpcCall({ path: '/service/relationship/send_friend_request', auth: 'JWT_REQUIRED', requestBody: SendFriendReq.toBinary(req), responseType: SendFriendRsp }),

  handleRequest: (req: HandleFriendReq) =>
    rpcCall({ path: '/service/relationship/handle_friend_request', auth: 'JWT_REQUIRED', requestBody: HandleFriendReq.toBinary(req), responseType: HandleFriendRsp }),

  removeFriend: (req: RemoveFriendReq) =>
    rpcCall({ path: '/service/relationship/remove_friend', auth: 'JWT_REQUIRED', requestBody: RemoveFriendReq.toBinary(req), responseType: RemoveFriendRsp }),

  blockUser: (req: BlockUserReq) =>
    rpcCall({ path: '/service/relationship/block_user', auth: 'JWT_REQUIRED', requestBody: BlockUserReq.toBinary(req), responseType: BlockUserRsp }),

  unblockUser: (req: UnblockUserReq) =>
    rpcCall({ path: '/service/relationship/unblock_user', auth: 'JWT_REQUIRED', requestBody: UnblockUserReq.toBinary(req), responseType: UnblockUserRsp }),

  listBlocked: (req: ListBlockedReq) =>
    rpcCall({ path: '/service/relationship/list_blocked', auth: 'JWT_REQUIRED', requestBody: ListBlockedReq.toBinary(req), responseType: ListBlockedRsp }),

  listPending: (req: ListPendingReq) =>
    rpcCall({ path: '/service/relationship/list_pending', auth: 'JWT_REQUIRED', requestBody: ListPendingReq.toBinary(req), responseType: ListPendingRsp }),
};
```

- [ ] **Step 2: 创建 contactStore `src/stores/contactStore.ts`**

```typescript
import { create } from 'zustand';
import { UserInfo } from '@/proto/chatnow/common/types';
import { FriendEvent } from '@/proto/chatnow/relationship/relationship_service';
import { RelationshipService } from '@/services/relationship';

interface ContactState {
  friends: UserInfo[];
  pendingRequests: FriendEvent[];
  blockedUsers: UserInfo[];
  loading: boolean;

  loadFriends: () => Promise<void>;
  loadPending: () => Promise<void>;
  loadBlocked: () => Promise<void>;
  sendRequest: (respondentId: string) => Promise<void>;
  handleRequest: (eventId: string, agree: boolean, applyUserId: string) => Promise<string | undefined>;
  removeFriend: (peerId: string) => Promise<void>;
  blockUser: (peerId: string) => Promise<void>;
  unblockUser: (peerId: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set) => ({
  friends: [],
  pendingRequests: [],
  blockedUsers: [],
  loading: false,

  loadFriends: async () => {
    const rsp = await RelationshipService.listFriends({
      requestId: crypto.randomUUID(),
      page: { limit: 200, cursor: '' },
    });
    if (rsp.header?.success) set({ friends: rsp.friendList ?? [] });
  },

  loadPending: async () => {
    const rsp = await RelationshipService.listPending({ requestId: crypto.randomUUID() });
    if (rsp.header?.success) set({ pendingRequests: rsp.event ?? [] });
  },

  loadBlocked: async () => {
    const rsp = await RelationshipService.listBlocked({
      requestId: crypto.randomUUID(),
      page: { limit: 100, cursor: '' },
    });
    if (rsp.header?.success) set({ blockedUsers: rsp.blockedList ?? [] });
  },

  sendRequest: async (respondentId) => {
    await RelationshipService.sendRequest({ requestId: crypto.randomUUID(), respondentId });
  },

  handleRequest: async (eventId, agree, applyUserId) => {
    const rsp = await RelationshipService.handleRequest({
      requestId: crypto.randomUUID(), notifyEventId: eventId, agree, applyUserId,
    });
    if (rsp.header?.success) return rsp.newConversationId;
  },

  removeFriend: async (peerId) => {
    await RelationshipService.removeFriend({ requestId: crypto.randomUUID(), peerId });
    set(s => ({ friends: s.friends.filter(f => f.userId !== peerId) }));
  },

  blockUser: async (peerId) => {
    await RelationshipService.blockUser({ requestId: crypto.randomUUID(), peerId });
  },

  unblockUser: async (peerId) => {
    await RelationshipService.unblockUser({ requestId: crypto.randomUUID(), peerId });
  },
}));
```

- [ ] **Step 3: 创建 ContactsPage + FriendList + PendingRequests**

ContactsPage:
```typescript
import { useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { FriendList } from './FriendList';
import { PendingRequests } from './PendingRequests';
import { useContactStore } from '@/stores/contactStore';
import styles from './ContactsPage.module.css';

export function ContactsPage() {
  const loadFriends = useContactStore(s => s.loadFriends);
  const loadPending = useContactStore(s => s.loadPending);
  useEffect(() => { loadFriends(); loadPending(); }, []);

  return (
    <MainLayout
      leftPanel={
        <div className={styles.panel}>
          <div className={styles.title}>联系人</div>
          <FriendList />
        </div>
      }
      mainContent={<PendingRequests />}
    />
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/contactStore.ts src/services/relationship.ts src/pages/contacts/
git commit -m "feat: add contacts module with friend list and pending requests"
```

---

### Task 12: WebSocket 客户端 + Presence Store

**Files:**
- Create: `src/services/ws-client.ts`
- Create: `src/stores/presenceStore.ts`
- Create: `src/services/presence.ts`

- [ ] **Step 1: 创建 PresenceService `src/services/presence.ts`**

```typescript
import { rpcCall } from './client';
import { GetPresenceReq, GetPresenceRsp, BatchGetPresenceReq, BatchGetPresenceRsp, SubscribeReq, SubscribeRsp } from '@/proto/chatnow/presence/presence_service';

export const PresenceService = {
  get: (req: GetPresenceReq) =>
    rpcCall({ path: '/service/presence/get', auth: 'JWT_REQUIRED', requestBody: GetPresenceReq.toBinary(req), responseType: GetPresenceRsp }),

  batchGet: (req: BatchGetPresenceReq) =>
    rpcCall({ path: '/service/presence/batch_get', auth: 'JWT_REQUIRED', requestBody: BatchGetPresenceReq.toBinary(req), responseType: BatchGetPresenceRsp }),

  subscribe: (req: SubscribeReq) =>
    rpcCall({ path: '/service/presence/subscribe', auth: 'JWT_REQUIRED', requestBody: SubscribeReq.toBinary(req), responseType: SubscribeRsp }),
};
```

- [ ] **Step 2: 创建 presenceStore `src/stores/presenceStore.ts`**

```typescript
import { create } from 'zustand';
import { Presence } from '@/proto/chatnow/presence/presence_service';
import { PresenceService } from '@/services/presence';

interface PresenceState {
  presences: Record<string, Presence>;
  updatePresence: (userId: string, presence: Presence) => void;
  batchGet: (userIds: string[]) => Promise<void>;
  subscribe: (userIds: string[]) => Promise<void>;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  presences: {},

  updatePresence: (userId, presence) => {
    set(s => ({ presences: { ...s.presences, [userId]: presence } }));
  },

  batchGet: async (userIds) => {
    const rsp = await PresenceService.batchGet({ requestId: crypto.randomUUID(), userIds });
    if (rsp.header?.success && rsp.presences) {
      set(s => ({ presences: { ...s.presences, ...rsp.presences } }));
    }
  },

  subscribe: async (userIds) => {
    await PresenceService.subscribe({ requestId: crypto.randomUUID(), subscribeUserIds: userIds });
  },
}));
```

- [ ] **Step 3: 创建 WebSocket 客户端 `src/services/ws-client.ts`**

```typescript
import { NotifyMessage, NotifyType } from '@/proto/chatnow/push/notify';
import { getAccessToken } from '@/utils/token';
import { useChatStore } from '@/stores/chatStore';
import { useContactStore } from '@/stores/contactStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useAuthStore } from '@/stores/authStore';

const WS_URL = 'ws://localhost:9001';

export class WSClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  connect() {
    const token = getAccessToken();
    if (!token) return;

    this.ws = new WebSocket(WS_URL);
    this.ws.binaryType = 'arraybuffer';

    this.ws.onopen = () => {
      this.sendAuth(token);
      this.startHeartbeat();
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = (event) => {
      const buf = new Uint8Array(event.data);
      const msg = NotifyMessage.fromBinary(buf);
      this.handleNotify(msg);
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.scheduleReconnect();
    };
  }

  private sendAuth(token: string) {
    const msg: NotifyMessage = {
      notifyType: NotifyType.CLIENT_AUTH,
      notifyRemarks: {
        oneofKind: 'clientAuth',
        clientAuth: { accessToken: token, deviceId: 'web-' + crypto.randomUUID() },
      },
    };
    this.ws?.send(NotifyMessage.toBinary(msg));
  }

  private handleNotify(msg: NotifyMessage) {
    switch (msg.notifyType) {
      case NotifyType.CHAT_MESSAGE_NOTIFY: {
        const messageInfo = msg.notifyRemarks?.value as any;
        if (messageInfo?.messageInfo) {
          useChatStore.getState().handleNewMessage(messageInfo.messageInfo);
          // Send ACK
          this.sendAck(messageInfo.messageInfo);
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
        const recalled = msg.notifyRemarks?.value as any;
        if (recalled) useChatStore.getState().handleMessageRecalled(recalled.conversationId, recalled.messageId);
        break;
      }
      case NotifyType.PRESENCE_CHANGE_NOTIFY: {
        const pc = msg.notifyRemarks?.value as any;
        if (pc) usePresenceStore.getState().updatePresence(pc.userId, { userId: pc.userId, aggregatedState: pc.state } as any);
        break;
      }
      case NotifyType.KICKED_BY_NEW_DEVICE:
      case NotifyType.KICKED_BY_REVOKE:
      case NotifyType.FORCE_LOGOUT:
        useAuthStore.getState().clearAuth();
        this.disconnect();
        window.location.hash = '#/login';
        break;
    }
  }

  private sendAck(msg: any) {
    const ack: NotifyMessage = {
      notifyType: NotifyType.MSG_PUSH_ACK,
      notifyRemarks: {
        oneofKind: 'msgPushAck',
        msgPushAck: {
          userId: useAuthStore.getState().userId ?? '',
          deviceId: 'web',
          messageId: msg.messageId,
          userSeq: msg.userSeq ?? BigInt(0),
          conversationId: msg.conversationId,
        },
      },
    };
    this.ws?.send(NotifyMessage.toBinary(ack));
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      const hb: NotifyMessage = {
        notifyType: NotifyType.CLIENT_HEARTBEAT,
        notifyRemarks: {
          oneofKind: 'heartbeat',
          heartbeat: { userId: useAuthStore.getState().userId ?? '', lastUserSeq: BigInt(0) },
        },
      };
      this.ws?.send(NotifyMessage.toBinary(hb));
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null; }
  }

  private scheduleReconnect() {
    this.reconnectTimer = setTimeout(() => {
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }, this.reconnectDelay);
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    this.ws?.close();
    this.ws = null;
  }
}

export const wsClient = new WSClient();
```

- [ ] **Step 4: 在 App.tsx 中集成 WS 生命周期**

```typescript
// 在登录成功后调用
import { wsClient } from '@/services/ws-client';
// authStore.setAuth() 之后调用 wsClient.connect()
// authStore.clearAuth() 时调用 wsClient.disconnect()
```

- [ ] **Step 5: Commit**

```bash
git add src/services/ws-client.ts src/services/presence.ts src/stores/presenceStore.ts
git commit -m "feat: add WebSocket client and presence store"
```

---

### Task 13: 上下文面板 (右侧面板)

**Files:**
- Create: `src/pages/context-panel/ContextPanel.tsx`, `ContextPanel.module.css`
- Create: `src/pages/context-panel/GroupInfo.tsx`
- Create: `src/pages/context-panel/MemberList.tsx`
- Create: `src/pages/context-panel/UserProfile.tsx`

- [ ] **Step 1: 创建 ContextPanel（条件渲染）**

```typescript
import { useUIStore, RightPanelType } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { GroupInfo } from './GroupInfo';
import { MemberList } from './MemberList';
import { UserProfile } from './UserProfile';
import styles from './ContextPanel.module.css';

export function ContextPanel() {
  const panelType = useUIStore(s => s.rightPanelType);
  const closeRightPanel = useUIStore(s => s.closeRightPanel);
  const activeId = useChatStore(s => s.activeConversationId);
  const conv = useChatStore(s => s.conversations.find(c => c.conversationId === activeId));

  if (!panelType || !conv) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{getTitle(panelType)}</span>
        <button className={styles.close} onClick={closeRightPanel}>✕</button>
      </div>
      {panelType === 'group_info' && <GroupInfo conv={conv} />}
      {panelType === 'user_profile' && <UserProfile />}
      {panelType === 'pinned_messages' && <div className={styles.placeholder}>置顶消息列表</div>}
    </div>
  );
}

function getTitle(type: RightPanelType): string {
  switch (type) {
    case 'group_info': return '群组信息';
    case 'user_profile': return '用户资料';
    case 'pinned_messages': return '置顶消息';
    default: return '';
  }
}
```

样式：
```css
.panel { padding: 14px; display: flex; flex-direction: column; height: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.title { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.close { width: 24px; height: 24px; border: none; border-radius: 6px; background: rgba(0,0,0,0.04); cursor: pointer; font-size: 12px; color: var(--text-muted); }
```

- [ ] **Step 2: 创建 GroupInfo + MemberList**

GroupInfo:
```typescript
import { Conversation } from '@/proto/chatnow/conversation/conversation_service';
import { MemberList } from './MemberList';

interface Props { conv: Conversation; }
export function GroupInfo({ conv }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{conv.name || '未命名群组'}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>成员 {conv.memberCount ?? 0} 人</div>
      </div>
      <MemberList convId={conv.conversationId!} />
    </div>
  );
}
```

MemberList:
```typescript
import { useState, useEffect } from 'react';
import { MemberItem } from '@/proto/chatnow/conversation/conversation_service';
import { ConversationService } from '@/services/conversation';
import { Avatar } from '@/components/Avatar/Avatar';

export function MemberList({ convId }: { convId: string }) {
  const [members, setMembers] = useState<MemberItem[]>([]);

  useEffect(() => {
    ConversationService.listMembers({
      requestId: crypto.randomUUID(),
      conversationId: convId,
      page: { limit: 100, cursor: '' },
    }).then(rsp => {
      if (rsp.members) setMembers(rsp.members);
    });
  }, [convId]);

  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {members.map(m => (
        <div key={m.userInfo?.userId} style={{padding:'7px 8px',borderRadius:10,display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.35)',backdropFilter:'blur(8px)',border:'1px solid rgba(0,0,0,0.04)'}}>
          <Avatar name={m.userInfo?.nickname ?? '?'} size={26} />
          <span style={{fontSize:11,color:'var(--text-primary)'}}>{m.userInfo?.nickname}</span>
          {m.role === 2 && <span style={{fontSize:9,color:'#f59e0b'}}>群主</span>}
          {m.role === 1 && <span style={{fontSize:9,color:'var(--accent)'}}>管理员</span>}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/context-panel/
git commit -m "feat: add context panel with group info and member list"
```

---

### Task 14: 设置页面 + Media Service

**Files:**
- Create: `src/pages/settings/SettingsPage.tsx`, `SettingsPage.module.css`
- Create: `src/pages/settings/ProfileEdit.tsx`, `ProfileEdit.module.css`
- Create: `src/services/media.ts`

- [ ] **Step 1: 创建 MediaService `src/services/media.ts`**

```typescript
import { rpcCall } from './client';
import { ApplyUploadReq, ApplyUploadRsp, CompleteUploadReq, CompleteUploadRsp, ApplyDownloadReq, ApplyDownloadRsp, GetFileInfoReq, GetFileInfoRsp } from '@/proto/chatnow/media/media_service';

export const MediaService = {
  applyUpload: (req: ApplyUploadReq) =>
    rpcCall({ path: '/service/media/apply_upload', auth: 'JWT_REQUIRED', requestBody: ApplyUploadReq.toBinary(req), responseType: ApplyUploadRsp }),

  completeUpload: (req: CompleteUploadReq) =>
    rpcCall({ path: '/service/media/complete_upload', auth: 'JWT_REQUIRED', requestBody: CompleteUploadReq.toBinary(req), responseType: CompleteUploadRsp }),

  applyDownload: (req: ApplyDownloadReq) =>
    rpcCall({ path: '/service/media/apply_download', auth: 'JWT_REQUIRED', requestBody: ApplyDownloadReq.toBinary(req), responseType: ApplyDownloadRsp }),

  getFileInfo: (req: GetFileInfoReq) =>
    rpcCall({ path: '/service/media/get_file_info', auth: 'JWT_REQUIRED', requestBody: GetFileInfoReq.toBinary(req), responseType: GetFileInfoRsp }),
};
```

- [ ] **Step 2: 创建 SettingsPage + ProfileEdit**

SettingsPage:
```typescript
import { MainLayout } from '@/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { userInfo, logout } = useAuth();

  return (
    <MainLayout
      leftPanel={
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>设置</div>
          <div className={styles.menuItem}>个人资料</div>
          <div className={styles.menuItem}>通用设置</div>
          <div className={styles.menuItem}>关于</div>
          <div className={styles.menuItemDanger} onClick={logout}>退出登录</div>
        </div>
      }
      mainContent={
        <ProfileEdit />
      }
    />
  );
}
```

ProfileEdit:
```typescript
import { useState, FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { IdentityService } from '@/services/identity';
import { Avatar } from '@/components/Avatar/Avatar';
import styles from './ProfileEdit.module.css';

export function ProfileEdit() {
  const { userInfo } = useAuth();
  const [nickname, setNickname] = useState(userInfo?.nickname ?? '');
  const [bio, setBio] = useState(userInfo?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await IdentityService.updateProfile({ requestId: crypto.randomUUID(), nickname, bio });
    setSaving(false);
  };

  return (
    <div className={styles.page}>
      <h2>个人资料</h2>
      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.avatarRow}>
          <Avatar name={userInfo?.nickname} size={64} />
          <span className={styles.changeAvatar}>更换头像</span>
        </div>
        <label className={styles.label}>昵称</label>
        <input className={styles.input} value={nickname} onChange={e => setNickname(e.target.value)} />
        <label className={styles.label}>签名</label>
        <input className={styles.input} value={bio} onChange={e => setBio(e.target.value)} />
        <button className={styles.saveBtn} type="submit" disabled={saving}>{saving ? '保存中...' : '保存'}</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/settings/ src/services/media.ts
git commit -m "feat: add settings page, profile edit, and media service"
```

---

### Task 15: 路由整合 + AuthGuard + Toast

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/Toast/ToastContainer.tsx`, `ToastContainer.module.css`
- Create: `src/components/AuthGuard.tsx`

- [ ] **Step 1: 创建 AuthGuard `src/components/AuthGuard.tsx`**

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function AuthGuard() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 2: 创建 ToastContainer `src/components/Toast/ToastContainer.tsx`**

```typescript
import { useUIStore } from '@/stores/uiStore';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const toasts = useUIStore(s => s.toasts);
  const removeToast = useUIStore(s => s.removeToast);

  return (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`} onClick={() => removeToast(t.id)}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
```

样式：
```css
.container { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
.toast {
  padding: 12px 20px; border-radius: var(--radius-md); font-size: 13px; cursor: pointer;
  backdrop-filter: blur(16px); animation: slideIn 0.2s ease-out;
}
.info { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.2); color: var(--accent); }
.error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.15); color: var(--danger); }
.success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.15); color: var(--success); }
@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
```

- [ ] **Step 3: 整合路由 `src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { ToastContainer } from './components/Toast/ToastContainer';
import { AuthPage } from './pages/auth/AuthPage';
import { ChatPage } from './pages/chat/ChatPage';
import { ContactsPage } from './pages/contacts/ContactsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<AuthGuard />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:convId" element={<ChatPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: 在 authStore.setAuth 中触发 WS 连接**

在 `authStore.ts` 的 `setAuth` 中：
```typescript
import { wsClient } from '@/services/ws-client';

// inside setAuth:
wsClient.connect();
```

在 `clearAuth` 中：
```typescript
wsClient.disconnect();
```

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/AuthGuard.tsx src/components/Toast/
git commit -m "feat: integrate routing, auth guard, toast notifications, WS lifecycle"
```

---

### Task 16: 端到端集成验证

- [ ] **Step 1: 启动后端服务**

```bash
cd /home/icepop/ChatNow && docker-compose up -d
```

- [ ] **Step 2: 启动前端**

```bash
cd /home/icepop/ChatNow-WebClient && npx vite
```

- [ ] **Step 3: 验证关键流程**

```
1. 打开 http://localhost:3000 → 重定向到 /login
2. 注册新用户 → 自动登录 → 跳转 /chat
3. 搜索并添加好友
4. 与好友发送文本/图片消息
5. 创建群聊
6. 在群聊中发消息、@提及
7. 验证 WebSocket 实时推送（新消息通知）
8. 撤回消息
9. 添加表情回应
10. 免打扰/置顶设置
11. 设置页面修改资料
12. 退出登录 → 重新登录
```

- [ ] **Step 4: 运行所有单元测试**

```bash
npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: final integration tweaks and verification"
```

---

## 文件清单总结

| 文件 | 职责 |
|------|------|
| `src/main.tsx` | 入口 |
| `src/App.tsx` | 路由 + AuthGuard + Toast |
| `src/styles/global.css` | CSS 变量 + 全局样式 |
| `src/styles/liquid-glass.module.css` | 毛玻璃复用 class |
| `src/utils/token.ts` | JWT localStorage 读写 |
| `src/utils/protobuf.ts` | serde helper |
| `src/services/client.ts` | HTTP fetch + JWT 注入 + 401 刷新 |
| `src/services/identity.ts` | IdentityService |
| `src/services/relationship.ts` | RelationshipService |
| `src/services/conversation.ts` | ConversationService |
| `src/services/transmite.ts` | TransmiteService |
| `src/services/message.ts` | MessageService |
| `src/services/media.ts` | MediaService |
| `src/services/presence.ts` | PresenceService |
| `src/services/ws-client.ts` | WebSocket 连接 + 事件路由 |
| `src/stores/authStore.ts` | 认证状态 + Token 管理 |
| `src/stores/chatStore.ts` | 会话/消息/同步 |
| `src/stores/contactStore.ts` | 好友/申请/屏蔽 |
| `src/stores/presenceStore.ts` | 在线状态 |
| `src/stores/uiStore.ts` | 导航/面板/Toast |
| `src/components/Avatar/` | 头像组件 |
| `src/components/NavRail/` | 导航栏 |
| `src/components/Toast/` | Toast 通知 |
| `src/components/AuthGuard.tsx` | 路由守卫 |
| `src/layouts/MainLayout.tsx` | 主四栏布局 |
| `src/pages/auth/` | 登录/注册 |
| `src/pages/chat/` | 聊天模块（会话列表+窗口+气泡+输入） |
| `src/pages/contacts/` | 联系人模块 |
| `src/pages/settings/` | 设置/资料编辑 |
| `src/pages/context-panel/` | 右侧上下文面板 |
| `src/hooks/useAuth.ts` | 认证 hook |
