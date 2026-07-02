import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AdminNotificationBell } from './AdminNotificationBell';

describe('AdminNotificationBell', () => {
  it('renders unread badge, premium panel actions, and notification previews', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AdminNotificationBell
          language="en"
          notifications={[
            {
              id: 1,
              kind: 'contact',
              title: 'New Contact Message',
              primary: 'John Smith',
              preview: 'Need glass facade details',
              created_at: '2026-07-02T10:00:00',
              is_read: false,
            },
            {
              id: 2,
              kind: 'quote',
              title: 'New Quote Request',
              primary: 'Villa Project',
              preview: 'Need a quote',
              created_at: '2026-07-02T09:45:00',
              is_read: false,
            },
          ]}
          unreadCount={2}
          isOpen
          onToggle={vi.fn()}
          onClose={vi.fn()}
          onNotificationOpen={vi.fn()}
          onMarkAllRead={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(html).toContain('aria-label="Notifications"');
    expect(html).toContain('2');
    expect(html).toContain('New Contact Message');
    expect(html).toContain('New Quote Request');
    expect(html).toContain('View all messages');
    expect(html).toContain('View all quote requests');
    expect(html).toContain('Mark all as read');
  });
});
