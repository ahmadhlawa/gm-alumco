import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MessageSquare } from 'lucide-react';
import { AdminStatCard } from './AdminStatCard';

describe('AdminStatCard', () => {
  it('shows unread inbox counts as a compact new indicator', () => {
    const html = renderToStaticMarkup(
      <AdminStatCard title="Contact Messages" value={24} icon={MessageSquare} unreadCount={3} unreadLabel="New" />,
    );

    expect(html).toContain('Contact Messages');
    expect(html).toContain('24');
    expect(html).toContain('3 New');
  });
});
