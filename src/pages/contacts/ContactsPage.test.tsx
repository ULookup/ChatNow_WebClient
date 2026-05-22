import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ContactsPage preview mode', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    });
  });

  afterEach(async () => {
    const { useContactStore } = await import('@/stores/contactStore');
    useContactStore.setState({
      friends: [],
      pendingRequests: [],
      blockedUsers: [],
    });
    cleanup();
    vi.unstubAllGlobals();
  });

  it('uses local preview contacts without loading relationship APIs', async () => {
    const [{ useContactStore }, { ContactsPage }] = await Promise.all([
      import('@/stores/contactStore'),
      import('./ContactsPage'),
    ]);
    const loadFriends = vi.fn();
    const loadPending = vi.fn();
    const loadBlocked = vi.fn();
    const originalState = useContactStore.getState();
    useContactStore.setState({
      loadFriends,
      loadPending,
      loadBlocked,
    });

    render(
      <MemoryRouter initialEntries={['/contacts?preview=1']}>
        <ContactsPage />
      </MemoryRouter>,
    );

    expect(loadFriends).not.toHaveBeenCalled();
    expect(loadPending).not.toHaveBeenCalled();
    expect(loadBlocked).not.toHaveBeenCalled();
    expect(screen.getByText('Ada')).toBeTruthy();
    expect(screen.getByText('Blocked User')).toBeTruthy();
    useContactStore.setState({
      loadFriends: originalState.loadFriends,
      loadPending: originalState.loadPending,
      loadBlocked: originalState.loadBlocked,
    });
  });
});
