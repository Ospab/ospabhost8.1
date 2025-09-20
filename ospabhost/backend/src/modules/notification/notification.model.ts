import { Prisma } from '@prisma/client';

export type Notification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  createdAt: Date;
};
