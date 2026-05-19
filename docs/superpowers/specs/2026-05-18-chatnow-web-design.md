# ChatNow Web 客户端设计文档

> 版本：1.0 | 日期：2026-05-18 | 面向：前端实现

---

## 一、概述

ChatNow Web 是一个基于 React + TypeScript 的完整 IM Web 应用。后端通过 HTTP/1.1（端口 9000）和 WebSocket（端口 9001）提供 6 个微服务，通信协议为 Protobuf 二进制序列化。前端使用 `protobuf-ts` 直接从 `.proto` 文件生成 TypeScript 客户端代码。

### 设计目标

1. 覆盖全部 6 个后端服务的功能
2. 视觉风格：iOS 26 Liquid Glass 浅色模式（灰白底色 + 毛玻璃面板）
3. 布局：Discord 式四栏结构（导航栏 + 列表 + 主内容 + 上下文面板）
4. 代码结构清晰、可测试、可维护

---

## 二、技术选型

| 层面 | 选型 | 理由 |
|------|------|------|
| 框架 | React 18+ / TypeScript | 生态最成熟，Protobuf 工具链完善 |
| 构建 | Vite | 现代 ESM 构建，HMR 快 |
| 协议 | protobuf-ts | 从 .proto 生成 TS 类型，零运行时依赖 |
| 状态管理 | Zustand | 轻量、TS 原生支持、按服务拆 Store |
| 路由 | React Router v6 | 主流选择，支持嵌套布局路由 |
| 样式 | CSS Modules | 液态玻璃需要精细控制每层的 backdrop-filter 参数 |
| 虚拟滚动 | @tanstack/react-virtual | 消息列表性能关键 |
| 测试 | Vitest + React Testing Library | 与 Vite 同生态 |

---

## 三、分层架构

```
┌─────────────────────────────────────────────┐
│  UI 层 — React Components                   │
│  页面组件 + 通用组件 + 布局组件               │
├─────────────────────────────────────────────┤
│  Store 层 — Zustand                         │
│  authStore / chatStore / contactStore /     │
│  presenceStore / uiStore                    │
├─────────────────────────────────────────────┤
│  Service 层 — API + WebSocket               │
│  IdentityService / RelationshipService /     │
│  ConversationService / TransmiteService /    │
│  MessageService / MediaService /             │
│  PresenceService / WSClient                  │
├─────────────────────────────────────────────┤
│  协议层 — Protobuf                           │
│  .proto → protobuf-ts → TS types            │
├─────────────────────────────────────────────┤
│  传输层                                      │
│  HTTP/1.1 :9000 (application/x-protobuf)    │
│  WebSocket :9001 (Protobuf binary frames)   │
└─────────────────────────────────────────────┘
```

### 数据流向

```
用户操作 → Component → Service → Protobuf serialize → HTTP POST → Gateway :9000
  → Response → Protobuf deserialize → Service → Zustand Store → Component re-render

WebSocket :9001 → WSClient → NotifyMessage deserialize → Event Router
  → chatStore / contactStore / presenceStore → Component re-render
```

---

## 四、项目目录结构

```
src/
├── main.tsx                          # 入口
├── App.tsx                           # 路由 + Auth 守卫 + WS 生命周期
├── proto/                            # 从 ../ChatNow/proto/ 生成的 TS 文件
│   └── (protobuf-ts generated)
├── services/                         # API 调用 + WebSocket 客户端
│   ├── client.ts                     # HTTP 客户端封装 (fetch + Protobuf)
│   ├── identity.ts                   # IdentityService 封装
│   ├── relationship.ts               # RelationshipService 封装
│   ├── conversation.ts               # ConversationService 封装
│   ├── transmite.ts                  # TransmiteService 封装
│   ├── message.ts                    # MessageService 封装
│   ├── media.ts                      # MediaService 封装
│   ├── presence.ts                   # PresenceService 封装
│   └── ws-client.ts                  # WebSocket 连接管理 + 事件路由
├── stores/                           # Zustand stores
│   ├── authStore.ts                  # JWT token / 用户信息 / 登录态
│   ├── chatStore.ts                  # 会话列表 / 消息缓存 / 未读数
│   ├── contactStore.ts               # 好友列表 / 待处理申请 / 屏蔽列表
│   ├── presenceStore.ts              # 在线状态缓存
│   └── uiStore.ts                    # 当前模块 / 展开面板 / Modal 状态
├── components/                       # 通用组件
│   ├── Avatar/
│   ├── MessageBubble/
│   ├── MessageInput/
│   ├── VirtualMessageList/
│   ├── ContextMenu/
│   ├── Modal/
│   └── SearchBar/
├── pages/                            # 页面组件
│   ├── auth/                         # 登录 / 注册 / 验证码
│   │   ├── AuthPage.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── VerifyCodeInput.tsx
│   ├── chat/                         # 聊天主模块
│   │   ├── ChatPage.tsx              # 三栏组合
│   │   ├── ConversationList.tsx
│   │   ├── ConversationItem.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── MessageBubble/            # 按消息类型拆分
│   │   │   ├── TextBubble.tsx
│   │   │   ├── ImageBubble.tsx
│   │   │   ├── FileBubble.tsx
│   │   │   ├── AudioBubble.tsx
│   │   │   ├── VideoBubble.tsx
│   │   │   └── LocationBubble.tsx
│   │   ├── MessageInput.tsx
│   │   ├── EmojiPicker.tsx
│   │   └── MentionDropdown.tsx
│   ├── contacts/                     # 联系人模块
│   │   ├── ContactsPage.tsx
│   │   ├── FriendList.tsx
│   │   ├── PendingRequests.tsx
│   │   └── BlockedList.tsx
│   ├── settings/                     # 设置模块
│   │   ├── SettingsPage.tsx
│   │   └── ProfileEdit.tsx
│   └── context-panel/                # 右侧上下文面板
│       ├── ContextPanel.tsx           # 按场景渲染不同内容
│       ├── GroupInfo.tsx
│       ├── MemberList.tsx
│       └── UserProfile.tsx
├── layouts/
│   └── MainLayout.tsx                # 导航栏 + 三栏布局
├── hooks/                            # 自定义 hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   └── useFileUpload.ts
├── utils/                            # 工具函数
│   ├── protobuf.ts                   # serde helper
│   ├── token.ts                      # JWT 读写
│   └── format.ts                     # 时间/文件大小等格式化
└── styles/
    ├── global.css                    # CSS 变量 (液态玻璃参数)
    └── liquid-glass.module.css       # 可复用的毛玻璃 mixin
```

---

## 五、组件树

### 认证页

```
App
├── AuthPage
│   ├── LoginForm          → IdentityService
│   ├── RegisterForm       → IdentityService
│   └── VerifyCodeInput
└── (登录成功 → MainLayout)
```

### 主布局

```
MainLayout
├── NavRail                → uiStore
│   ├── UserAvatar         → 点击进入 Profile
│   ├── NavIcon (Chat)
│   ├── NavIcon (Contacts)
│   └── NavIcon (Settings)
├── LeftPanel              → 按模块切换内容
├── MainContent            → 按模块切换内容
├── RightPanel             → 上下文面板
└── WSManager              → WebSocket 生命周期
```

### 聊天模块（核心）

```
ChatPage
├── ChatListPanel (左)
│   ├── SearchBar
│   ├── ConversationList   → chatStore
│   │   └── ConversationItem (×N)
│   │       ├── Avatar + Name
│   │       ├── LastMessagePreview
│   │       ├── UnreadBadge
│   │       └── Pin/Mute Icons
│   └── CreateGroupButton  → ConversationService
├── ChatWindow (中)
│   ├── ChatHeader         → chatStore + presenceStore
│   ├── VirtualMessageList → chatStore (虚拟滚动)
│   │   └── MessageBubble (×8 种类型)
│   ├── ReactionPicker     → MessageService
│   └── MessageInput       → TransmiteService + MediaService
│       ├── TextEditor
│       ├── EmojiPicker
│       ├── FileUploader
│       └── MentionDropdown
└── ContextPanel (右)      → 按群聊/私聊切换
    ├── GroupInfo / UserProfile
    ├── MemberList          → presenceStore
    └── PinnedMessages      → MessageService
```

---

## 六、状态管理 (Zustand Stores)

### authStore

```
字段: accessToken, refreshToken, userId, userInfo, isAuthenticated
动作: login(), register(), logout(), refreshToken(), getProfile()
```

### chatStore

```
字段: conversations[], activeConversationId, messagesByConv (Map<convId, Message[]>),
      unreadCounts (Map<convId, number>), lastReadSeq (Map<convId, uint64>)
动作: listConversations(), openConversation(), sendMessage(),
      syncMessages(), getHistory(), markRead(), saveDraft(),
      handleNewMessage (from WS), handleMessageRecalled (from WS)
```

### contactStore

```
字段: friends[], pendingRequests[], blockedUsers[]
动作: listFriends(), sendRequest(), handleRequest(), removeFriend(),
      blockUser(), unblockUser(), searchFriends(), searchUsers()
```

### presenceStore

```
字段: presences (Map<userId, Presence>), subscriptions[]
动作: getPresence(), batchGetPresence(), subscribe(), unsubscribe(),
      handlePresenceChange (from WS)
```

### uiStore

```
字段: activeModule ('chat'|'contacts'|'settings'), rightPanelOpen, rightPanelType,
      showCreateGroup, toastNotifications[]
动作: switchModule(), toggleRightPanel(), showToast(), dismissToast()
```

---

## 七、Service 层

### HTTP 客户端 (client.ts)

所有 HTTP 请求的统一入口：

- `POST` 到 `http://<host>:9000/service/<name>/<method>`
- `Content-Type: application/x-protobuf`
- 请求体：对应 Proto Request Message 的序列化字节
- 响应体：Proto Response Message 的反序列化
- 自动注入 `Authorization: Bearer <access_token>`（JWT 接口）
- 自动注入 `x-trace-id`（UUID）
- 401 时自动调用 RefreshToken，成功后重试原请求
- RefreshToken 失败 → 清除 authStore → 跳转登录页

### WebSocket 客户端 (ws-client.ts)

生命周期：

1. 登录成功后建立连接 → `ws://<host>:9001`
2. 发送 `CLIENT_AUTH` 帧（携带 access_token + device_id）
3. 认证成功后进入就绪态
4. 接收 `NotifyMessage` 帧 → 根据 `notify_type` 路由到对应 Store / Service
5. 收到 `CHAT_MESSAGE_NOTIFY` → 发 `MSG_PUSH_ACK`
6. 定期发送 `CLIENT_HEARTBEAT`

事件路由表：

| NotifyType | 路由目标 |
|------------|----------|
| CHAT_MESSAGE_NOTIFY (3) | chatStore.handleNewMessage() |
| FRIEND_ADD_APPLY_NOTIFY (0) | contactStore + Toast |
| FRIEND_ADD_PROCESS_NOTIFY (1) | contactStore + Toast |
| FRIEND_REMOVE_NOTIFY (4) | contactStore |
| MESSAGE_RECALLED_NOTIFY (5) | chatStore.handleMessageRecalled() |
| PRESENCE_CHANGE_NOTIFY (6) | presenceStore.handlePresenceChange() |
| TYPING_NOTIFY (7) | chatStore (输入状态指示) |
| REACTION_CHANGED_NOTIFY (8) | chatStore (更新 reactions) |
| PIN_CHANGED_NOTIFY (9) | chatStore |
| READ_RECEIPT_NOTIFY (10) | chatStore |
| KICKED_BY_NEW_DEVICE (11) | authStore → 强制登出 |
| KICKED_BY_REVOKE (12) | authStore → 强制登出 |
| FORCE_LOGOUT (13) | authStore → 强制登出 |
| CONVERSATION_CREATE_NOTIFY (2) | chatStore |
| CONVERSATION_DISMISSED_NOTIFY (14) | chatStore |

---

## 八、路由设计

```
/login            → AuthPage (未登录态)
/register         → AuthPage (注册 Tab)
/chat             → MainLayout → ChatPage (默认页)
/chat/:convId     → MainLayout → ChatPage → ChatWindow (打开指定会话)
/contacts         → MainLayout → ContactsPage
/settings         → MainLayout → SettingsPage
/settings/profile → MainLayout → ProfileEdit
/                 → 未登录跳 /login，已登录跳 /chat
```

路由守卫：`<AuthGuard>` 组件检查 `authStore.isAuthenticated`，未登录重定向到 `/login`。

---

## 九、样式系统

### CSS 变量 (global.css)

```css
:root {
  --bg-primary: #e8ecf1;
  --bg-secondary: #f0f2f5;
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-blur: blur(24px) saturate(140%);
  --glass-border: 1px solid rgba(0, 0, 0, 0.06);
  --accent: #6366f1;
  --accent-gradient: linear-gradient(135deg, rgba(99,102,241,0.75), rgba(139,92,246,0.7));
  --text-primary: #222;
  --text-secondary: #666;
  --text-muted: #999;
}
```

### 液态玻璃 Mixin

每个需要毛玻璃效果的面板使用不同的 blur 和透明度参数：

- 导航栏：`rgba(255,255,255,0.45)` + `blur(24px)`
- 会话列表：`rgba(255,255,255,0.35)` + `blur(28px)`
- 聊天区：`rgba(255,255,255,0.2)` + `blur(32px)`（最通透）
- 右面板：`rgba(255,255,255,0.3)` + `blur(24px)`
- 气泡（对方）：`rgba(255,255,255,0.65)` + `blur(16px)` + `box-shadow`
- 气泡（自己）：靛蓝渐变 + `blur(10px)`

---

## 十、错误处理

### 统一错误处理

1. **HTTP 响应** → 检查 `ResponseHeader.success`，`false` 时读取 `error_code` + `error_message`
2. **错误码映射**：维护 error_code → 中文提示的映射表
3. **401 自动刷新**：access_token 过期时自动用 refresh_token 续期，失败则跳登录
4. **网络异常**：fetch 失败时显示 Toast + 自动重试（指数退避，最多 3 次）
5. **WebSocket 断线**：自动重连（指数退避，最长间隔 30s），重连成功后 SyncMessages 补数据
6. **Protobuf 反序列化失败**：记录日志 + 跳过该消息 + 上报 error_code

### 用户可见的错误

- Toast 通知：4 秒自动消失
- 消息发送失败：消息气泡标红 + 点击重发
- 文件上传失败：进度条变红 + 可重试

---

## 十一、关键实现要点

### 消息同步策略

1. **在线时**：WebSocket `CHAT_MESSAGE_NOTIFY` 实时接收 → 写 chatStore → UI 更新
2. **重连后**：调用 SyncMessages 以本地最新 `seq_id` 为 `after_seq` 增量拉取
3. **翻历史**：调用 GetHistory 以当前最小 `seq_id` 为 `before_seq` 向上翻页
4. **防重处理**：基于 `client_msg_id` 去重（发送时生成的 UUID）

### 消息幂等

发送消息前生成 `client_msg_id`（UUID v4），立即乐观更新 UI。若短时间内重试，后端基于此字段防重。

### 文件上传

```
ApplyUpload (获取 presigned PUT URL + file_id)
  → 客户端 HTTP PUT 到 presigned URL
  → CompleteUpload (通知服务端)
  → 将 file_id 填入消息内容 → SendMessage
```

秒传场景：`already_exists=true` 时跳过 PUT 步骤。

### 虚拟滚动

聊天消息列表使用 `@tanstack/react-virtual`，预估每项高度 + 动态测量。支持从消息列表任意位置开始渲染（跳转到搜索到的历史消息）。

---

## 十二、不在本期范围内的功能

- 分片上传（>100MB 文件）— 后端暂未暴露 HTTP 路由
- 语音识别（ASR）— 后端为占位实现
- 音视频通话
- 多语言国际化
- PWA / Service Worker
- E2E 加密
