# ChatNow Liquid Console Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Clear Liquid Console UI direction for the existing ChatNow React client.

**Architecture:** Add a small local SVG icon primitive, then apply it across the existing shell, chat, contacts, and settings components. Keep the current stores and protobuf service boundaries unchanged; the redesign is a presentational layer over existing API-backed state.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules, Zustand, Vitest, React Testing Library.

---

## File Structure

- Create: `src/components/Icon/Icon.tsx` for the local icon registry and reusable icon-only button.
- Create: `src/components/Icon/Icon.module.css` for shared icon button states.
- Create: `src/components/Icon/Icon.test.tsx` for accessibility and rendering tests.
- Modify: `src/styles/global.css` for Liquid Console tokens.
- Modify: `src/layouts/MainLayout.module.css` for stable panel surfaces and responsive behavior.
- Modify: `src/components/NavRail/NavRail.tsx` and `src/components/NavRail/NavRail.module.css` to replace emoji navigation with icon buttons.
- Modify: `src/pages/chat/ConversationList.tsx`, `ConversationList.module.css`, `ConversationItem.tsx`, and `ConversationItem.module.css` to expose search, pin, mute, unread, draft, and selection states.
- Modify: `src/pages/chat/ChatHeader.tsx` and `ChatHeader.module.css` to expose search/details controls and metadata.
- Modify: `src/pages/chat/MessageInput/MessageInput.tsx` and `MessageInput.module.css` to replace emoji buttons with icon buttons while preserving send behavior and emoji picker behavior.
- Modify: `src/pages/chat/MessageBubble/MessageBubble.module.css` to refine bubble rhythm.
- Modify: contacts and settings pages to remove inline card styling and use the shared visual language.

## Task 1: Icon Primitive

**Files:**
- Create: `src/components/Icon/Icon.tsx`
- Create: `src/components/Icon/Icon.module.css`
- Create: `src/components/Icon/Icon.test.tsx`

- [ ] **Step 1: Write failing icon accessibility test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon, IconButton } from './Icon';

describe('Icon', () => {
  it('renders decorative svg icons as aria-hidden', () => {
    const { container } = render(<Icon name="search" />);
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('requires icon-only buttons to expose an accessible label', () => {
    render(<IconButton icon="send" label="发送消息" />);
    expect(screen.getByRole('button', { name: '发送消息' })).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- src/components/Icon/Icon.test.tsx --run`

Expected: fail because `src/components/Icon/Icon.tsx` does not exist.

- [ ] **Step 3: Implement the icon primitive**

Create an `IconName` union covering `message-circle`, `users`, `settings`, `search`, `pin`, `bell-off`, `smile`, `paperclip`, `send`, `info`, `check`, `x`, `plus`, `log-out`, `edit`, and `save`. Render inline SVG paths with `currentColor`, `aria-hidden="true"`, and `focusable="false"`. Export `IconButton` with `aria-label`, optional `title`, optional `active`, optional `variant`, and optional normal button props.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- src/components/Icon/Icon.test.tsx --run`

Expected: pass.

## Task 2: Global Tokens And App Shell

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/MainLayout.module.css`
- Modify: `src/components/NavRail/NavRail.tsx`
- Modify: `src/components/NavRail/NavRail.module.css`

- [ ] **Step 1: Update tokens**

Add light gray-blue Liquid Console tokens for panel, surface, hover, selected, border, accent, danger, success, warning, shadow, and focus ring. Preserve existing token names where possible so current CSS keeps working.

- [ ] **Step 2: Replace nav emoji with icon buttons**

Use `Icon` or `IconButton` for chat, contacts, and settings. Keep `switchModule()` behavior unchanged and preserve the user avatar settings shortcut.

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

## Task 3: Chat List And Header

**Files:**
- Modify: `src/pages/chat/ConversationList.tsx`
- Modify: `src/pages/chat/ConversationList.module.css`
- Modify: `src/pages/chat/ConversationItem.tsx`
- Modify: `src/pages/chat/ConversationItem.module.css`
- Modify: `src/pages/chat/ChatHeader.tsx`
- Modify: `src/pages/chat/ChatHeader.module.css`

- [ ] **Step 1: Render API-backed state**

Show `self.isPinned`, `self.isMuted`, `self.unreadCount`, `self.draft`, `lastMessage.contentPreview`, and `lastMessage.sentAtMs` where available. Use SVG icons instead of emoji and do not invent backend state.

- [ ] **Step 2: Improve search and selected states**

Replace the search placeholder emoji with a real search icon. Make the active row, hover row, unread badge, muted unread badge, pin, and mute states visually distinct.

- [ ] **Step 3: Update chat header controls**

Show avatar, name, member count metadata, pinned/muted hints, message search button, and details button. Icon-only controls must have accessible labels.

- [ ] **Step 4: Verify build**

Run: `npm run build`

Expected: pass.

## Task 4: Message Input And Bubble Polish

**Files:**
- Modify: `src/pages/chat/MessageInput/MessageInput.tsx`
- Modify: `src/pages/chat/MessageInput/MessageInput.module.css`
- Modify: `src/pages/chat/MessageBubble/MessageBubble.module.css`

- [ ] **Step 1: Replace input emoji buttons**

Use `IconButton` for emoji, attachment, and send. Preserve current emoji picker toggle, `contentEditable` input, Enter-to-send behavior, and `sendMessage()` call shape.

- [ ] **Step 2: Mark non-wired attachment honestly**

Keep the attachment affordance visible but disabled with an accessible label indicating media upload is not wired in this component yet.

- [ ] **Step 3: Polish bubbles**

Refine incoming/outgoing bubble background, border, radius, max width, and recalled message styling without changing message type rendering.

- [ ] **Step 4: Verify targeted behavior**

Run: `npm test -- src/components/Icon/Icon.test.tsx --run`

Expected: pass.

## Task 5: Contacts, Settings, And Rendered QA

**Files:**
- Modify: `src/pages/contacts/ContactsPage.tsx`
- Modify: `src/pages/contacts/FriendList.tsx`
- Modify: `src/pages/contacts/PendingRequests.tsx`
- Modify: `src/pages/contacts/ContactsPage.module.css`
- Modify: `src/pages/settings/SettingsPage.tsx`
- Modify: `src/pages/settings/SettingsPage.module.css`

- [ ] **Step 1: Remove inline visual styling**

Move contact and pending-request layout styling into CSS modules. Use the shared visual language and add accept/reject icon controls where current store actions support them.

- [ ] **Step 2: Update settings menu icons**

Add edit, settings, info, and logout icon treatments while preserving logout behavior.

- [ ] **Step 3: Run verification commands**

Run: `npm run lint`

Expected: pass.

Run: `npm run build`

Expected: pass.

- [ ] **Step 4: Browser QA**

Start dev server with `npm run dev -- --host 127.0.0.1`. Open the localhost URL in the in-app browser. Verify page identity, nonblank render, no framework overlay, console health, desktop screenshot, narrow viewport screenshot, and one interaction such as nav switching or emoji picker toggle.

## Self-Review

Spec coverage: the plan covers icon system, tokens, shell, chat list, chat header, message input, bubbles, contacts, settings, and verification.

Placeholder scan: no TBD/TODO/implement-later steps are present.

Type consistency: component names and file paths match the current repository structure.
