// Статусы для серверов, чеков, тикетов и т.д.
export const SERVER_STATUSES = [
  'creating',
  'running',
  'stopped',
  'blocked',
  'deleted',
];

export const CHECK_STATUSES = [
  'pending',
  'approved',
  'rejected',
];

export const TICKET_STATUSES = [
  'open',
  'closed',
  'waiting',
];

export const USER_ROLES = [
  'user',
  'operator',
  'admin',
];
