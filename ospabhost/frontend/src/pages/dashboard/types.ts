export interface User {
  username: string;
  operator: number;
}

export interface Response {
  id: number;
  message: string;
  createdAt: string;
  operator: {
    username: string;
  };
}

export interface Ticket {
  id: number;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    email: string;
  };
  responses: Response[];
}

export interface UserData {
  user: User;
  balance: number;
  servers: unknown[];
  tickets: Ticket[];
}