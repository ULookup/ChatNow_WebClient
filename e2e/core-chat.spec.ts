import { test, expect, type Page } from '@playwright/test';

// Browser plugin not available. Use Playwright against a real disposable Linux backend.
// All identities below are synthetic and owned by this disposable test stack.
test('two users log in, exchange messages, reload, and catch up after a disconnect', async ({ browser }) => {
  const options = { baseURL: process.env.CHATNOW_WEB_URL || 'http://127.0.0.1:5173' };
  const contexts = await Promise.all([browser.newContext(options), browser.newContext(options)]);
  let bobConnections = 0;
  let disconnectBob: (() => Promise<void>) | undefined;
  await contexts[1].routeWebSocket('**/ws', route => {
    bobConnections++;
    const server = route.connectToServer();
    disconnectBob = async () => { await Promise.all([route.close(), server.close()]); };
  });
  const [alice, bob] = await Promise.all(contexts.map(context => context.newPage()));
  const errors: string[] = [];
  for (const page of [alice, bob]) page.on('pageerror', error => { errors.push(error.message); console.error('Browser error:', error.message); });
  const suffix = Date.now().toString(36);
  const accounts = [`qa${suffix}a`, `qa${suffix}b`];
  const password = 'ChatNow123';
  try {
    const ids = await Promise.all([alice, bob].map(async (page, index) => {
      await page.goto('/login');
      return page.evaluate(async ({ account, password }) => {
        const path = '/src/stores/authStore.ts';
        const { useAuthStore } = await import(path);
        await useAuthStore.getState().register(account, password, account);
        const id = useAuthStore.getState().userId;
        await useAuthStore.getState().logout();
        return id as string;
      }, { account: accounts[index], password });
    }));
    await Promise.all([alice, bob].map(async (page, index) => {
      await page.goto('/login');
      await page.getByLabel('邮箱 / 手机号 / 用户名').fill(accounts[index]);
      await page.getByLabel('密码', { exact: true }).fill(password);
      await page.locator('button[type="submit"]').click();
      await expect(page).toHaveURL(/\/chat$/);
    }));
    const conversationId = await alice.evaluate(async ids => {
      const servicePath = '/src/services/conversation.ts';
      const protoPath = '/src/proto/conversation/conversation_service.ts';
      const { ConversationService } = await import(servicePath);
      const { ConversationType } = await import(protoPath);
      const response = await ConversationService.create({ requestId: crypto.randomUUID(), type: ConversationType.GROUP, name: 'Core integration', memberIds: ids });
      if (!response.header?.success) throw new Error(response.header?.errorMessage || 'Conversation setup failed');
      return response.conversation.conversationId as string;
    }, ids);
    await Promise.all([alice, bob].map(page => page.goto(`/chat/${conversationId}`)));
    await expect(alice.locator('[contenteditable="true"]')).toBeVisible();
    expect(errors).toEqual([]);
    const send = async (page: Page, message: string) => {
      await page.locator('[contenteditable="true"]').fill(message);
      await page.getByRole('button', { name: '发送消息', exact: true }).click();
    };
    const first = `alice-${suffix}`;
    await send(alice, first);
    await expect(bob.getByText(first, { exact: true }).last()).toBeVisible();
    const reply = `bob-${suffix}`;
    await send(bob, reply);
    await expect(alice.getByText(reply, { exact: true }).last()).toBeVisible();
    await bob.reload();
    await expect(bob.getByText(first, { exact: true }).last()).toBeVisible();
    const afterReload = `reload-${suffix}`;
    await send(alice, afterReload);
    await expect(bob.getByText(afterReload, { exact: true }).last()).toBeVisible();
    await contexts[1].setOffline(true);
    const previousConnections = bobConnections;
    expect(disconnectBob).toBeDefined();
    await disconnectBob!();
    const missed = `offline-${suffix}`;
    await send(alice, missed);
    await contexts[1].setOffline(false);
    await expect.poll(() => bobConnections).toBeGreaterThan(previousConnections);
    await expect(bob.getByText(missed, { exact: true }).last()).toBeVisible({ timeout: 35000 });
    expect(errors).toEqual([]);
    await alice.screenshot({ path: 'test-results/core-chat-alice.png', fullPage: true });
    await bob.screenshot({ path: 'test-results/core-chat-bob.png', fullPage: true });
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
