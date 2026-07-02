import { describe, expect, it, vi } from 'vitest';
import { loadDashboardData } from './Dashboard';

vi.mock('@/api/dashboard', () => ({
  getDashboardStats: vi.fn(async () => ({
    projects: 1,
    local_projects: 1,
    international_projects: 0,
    featured_projects: 0,
    services: 1,
    partners: 1,
    contact_messages: { NEW: 1 },
    quote_requests: { NEW: 1 },
    unread_contact_messages: 1,
    unread_quote_requests: 1,
  })),
}));

vi.mock('@/api/messages', () => ({
  listContactMessages: vi.fn(async () => {
    throw new Error('inbox unavailable');
  }),
  listQuoteRequests: vi.fn(async () => {
    throw new Error('quotes unavailable');
  }),
}));

vi.mock('@/api/auditLogs', () => ({
  listAuditLogs: vi.fn(async () => {
    throw new Error('audit unavailable');
  }),
}));

describe('loadDashboardData', () => {
  it('keeps dashboard stats available when optional normal-admin activity fails', async () => {
    const data = await loadDashboardData(false);

    expect(data.stats.projects).toBe(1);
    expect(data.messages).toEqual([]);
    expect(data.quotes).toEqual([]);
    expect(data.logs).toEqual([]);
  });

  it('keeps dashboard stats available when optional super-admin activity fails', async () => {
    const data = await loadDashboardData(true);

    expect(data.stats.projects).toBe(1);
    expect(data.messages).toEqual([]);
    expect(data.quotes).toEqual([]);
    expect(data.logs).toEqual([]);
  });
});
