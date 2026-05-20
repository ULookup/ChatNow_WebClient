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
