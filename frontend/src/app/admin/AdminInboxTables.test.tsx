import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ContactMessageDto, QuoteRequestDto } from '@/api/types';
import { ContactMessagesTable } from './AdminContactMessages';
import { QuoteRequestsTable } from './AdminQuoteRequests';

const contact: ContactMessageDto = {
  id: 1,
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+970599000000',
  subject: 'Villa',
  message: 'Need glass facade details',
  status: 'NEW',
  is_read: false,
  created_at: '2026-07-02T10:00:00',
};

const quote: QuoteRequestDto = {
  id: 2,
  name: 'Villa Owner',
  email: 'owner@example.com',
  phone: '+970598000000',
  service_type: 'Villa Project',
  message: 'Need a quote',
  plans_link: null,
  status: 'NEW',
  is_read: false,
  created_at: '2026-07-02T10:00:00',
  updated_at: '2026-07-02T10:00:00',
};

describe('admin inbox tables', () => {
  it('renders contact message open and delete actions', () => {
    const html = renderToStaticMarkup(
      <ContactMessagesTable
        items={[contact]}
        language="en"
        dir="ltr"
        onChangeStatus={vi.fn()}
        onOpen={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(html).toContain('New');
    expect(html).toContain('Open contact message');
    expect(html).toContain('Delete contact message');
  });

  it('renders quote request open and delete actions', () => {
    const html = renderToStaticMarkup(
      <QuoteRequestsTable
        items={[quote]}
        language="en"
        dir="ltr"
        onChangeStatus={vi.fn()}
        onOpen={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(html).toContain('New');
    expect(html).toContain('Open quote request');
    expect(html).toContain('Delete quote request');
  });
});
