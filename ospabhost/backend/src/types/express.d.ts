// Типы для расширения Express Request
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username: string;
      password: string;
      balance: number;
      operator: number;
      createdAt: Date;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
