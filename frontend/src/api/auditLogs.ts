import { apiRequest } from './client';
import type { AuditLogDto } from './types';

export const listAuditLogs = (limit = 100) => apiRequest<AuditLogDto[]>(`/admin/audit-logs?limit=${limit}`, { authenticated: true });
