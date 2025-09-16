export interface User {
  username: string;
  operator: number;
}

export interface UserData {
  user: User;
  balance: number;
  servers: unknown[];
  tickets: unknown[];
}