# ChatNow Liquid Console UI Redesign

> Version: 1.0 | Date: 2026-05-19 | Scope: visual redesign and icon system for the existing React client

## Goal

Redesign the ChatNow Web client into a clean, light "Liquid Console" interface that preserves the existing four-column IM architecture while making backend API capabilities visible through clearer UI states, controls, and iconography.

## Product Context

The app is a React + TypeScript + Vite IM client using generated protobuf service clients. The backend surface represented in this repository includes:

- Identity and auth profile flows.
- Conversation list, active conversation state, drafts, pinning, muting, unread counts, read position, and member metadata.
- Message sync, history, search, recall, and reactions.
- Message transmit with client idempotency, replies, mentions, and forwarding metadata.
- Media upload with single-part and multipart upload flows.
- Friend list, pending requests, friend handling, removing, blocking, and unblocking.
- Presence subscriptions and status display.

The redesign must make these capabilities feel like natural parts of the chat product without adding fake workflows that are not wired in the current stores or service wrappers.

## Design Direction

Use the approved **A. Clear Liquid Console** direction:

- Light gray-blue app background with subtle depth.
- White translucent panels with fine borders and restrained shadows.
- Compact, consistent icon buttons instead of emoji controls.
- Main task hierarchy: conversations -> current chat -> contextual details.
- High readability for long chat sessions.
- Polished but practical UI, closer to a native messaging client than a marketing page.

Avoid dark-mode-only redesigns, admin-dashboard density, decorative blobs, oversized cards, and unrelated feature panels.

## Layout

Keep the existing application shell:

- `NavRail`: app-level navigation, current user avatar, chat, contacts, settings.
- Left panel: conversation list or module-specific list content.
- Main content: active chat, contacts workflow, or settings content.
- Optional right panel: group info, member list, user profile, and future contextual tools.

Desktop should remain a stable multi-panel product surface. Mobile and narrow layouts should collapse without text overlap or fixed-width overflow.

## Icon System

Replace visible emoji action buttons with a local SVG icon system:

- Navigation: chat, contacts, settings.
- Chat header: search messages, pin/details, panel toggle where supported.
- Conversation row: pinned, muted, unread.
- Message input: emoji, attachment, send.
- Contacts: add friend, accept, reject, remove, block.
- Settings/profile: edit, save, logout.

Icon rules:

- Use `currentColor`.
- Use 16-18px optical icon size.
- Use 32-36px button boxes.
- Use 2px stroke, round joins/caps for outline icons.
- Provide accessible labels through `aria-label` or `title`.
- Keep hover, active, selected, and disabled states consistent.

## Conversation List

The conversation list should show the state already provided by `Conversation` and `SelfMemberInfo`:

- Search input with a real search icon and calm placeholder copy.
- Conversation avatar, name, last message preview, relative timestamp when available.
- `self.unreadCount` as a compact badge.
- `self.isPinned` as a small pin icon.
- `self.isMuted` as a small muted bell icon.
- `self.draft` as a "draft" hint in the preview line when present.
- Active conversation with a clear selected background and subtle border.

The list should stay scan-friendly and not turn into cards inside cards.

## Chat Header

The active chat header should contain:

- Avatar, conversation name, and a compact metadata line.
- Member count for groups when available.
- Muted/pinned state when available.
- Message search button.
- Details/context panel button.

Buttons should be visual controls, not emoji text. The header should remain compact enough to leave vertical room for messages.

## Message Area

The message list should keep the existing message-type component model while improving visual rhythm:

- Incoming and outgoing bubbles should have distinct but restrained surfaces.
- Recalled messages should read as system-muted content.
- File, image, video, audio, and location bubbles should share the same visual family.
- Reaction groups should have room to render as small chips when wired.
- Empty and loading states should feel intentional.

Do not replace real message content with static screenshots or decorative mock content.

## Message Input

The input bar should expose current and near-term backend capabilities:

- Emoji picker button.
- Attachment button mapped to media upload affordance.
- Contenteditable text editor.
- Send button with paper-plane icon.
- Space for reply or mention state above the editor when these are wired.

The first implementation can preserve current text send behavior while making attachment and future controls visually prepared. Inert controls must not pretend to complete uploads; disabled or non-wired states should be visibly honest.

## Contacts And Settings

Bring the same visual system to contacts and settings:

- Contacts page should distinguish friends and pending requests.
- Pending requests should use explicit accept/reject icons and labels.
- Friend actions should map to remove/block where available.
- Settings/profile editing should use consistent edit/save/logout icons and button treatment.

## Styling Tokens

Add or refine global tokens for:

- App background.
- Panel background.
- Elevated surface.
- Hairline border.
- Text primary, secondary, muted.
- Accent blue.
- Success, warning, danger.
- Selected background.
- Hover background.
- Shadow.
- Radius scale.

Keep the palette light, neutral, and blue-accented without becoming a single-hue page.

## Accessibility

Every icon-only button must have an accessible name. Keyboard focus must be visible. Color should not be the only signal for unread, muted, pinned, or destructive actions.

## Implementation Boundaries

This redesign should be implemented through existing React components, CSS modules, and stores. It should not introduce a new UI library, router, data layer, or backend contract. Add small reusable primitives only where they reduce repeated SVG/button code.

## Verification

Before completion:

- Run the TypeScript build.
- Run lint when available.
- Start the Vite dev server.
- Open the app in the in-app browser on localhost.
- Verify the first meaningful screen is not blank and has no framework overlay.
- Check desktop and one narrow viewport.
- Exercise at least one visible interaction such as switching nav modules, opening a conversation when data exists, or toggling the emoji picker.
- Check console errors and document any backend-unavailable errors separately from frontend runtime errors.
