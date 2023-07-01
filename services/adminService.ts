import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async () => {
  const users: User[] = await prisma.user.findMany();
  return users;
};
