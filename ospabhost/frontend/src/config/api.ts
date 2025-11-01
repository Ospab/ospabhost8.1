/**
 * Централизованная конфигурация API
 */

// API URL - напрямую на порт 5000
export const API_URL = import.meta.env.VITE_API_URL || 'https://ospab.host:5000';

// WebSocket URL - напрямую на порт 5000
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'wss://ospab.host:5000';
