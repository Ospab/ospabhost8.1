export interface User {
  username: string;
  operator: number;
}

export interface Ticket {
  id: number;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  responses: unknown[];
  user?: { username: string };
}

export interface Server {
  id: number;
  name: string;
  status: string;
  // можно добавить другие поля по необходимости
}

export interface UserData {
  user: User;
  balance: number;
  servers: Server[];
  tickets: Ticket[];
}