import prisma from "@config/db";

export const getList = async () => prisma.pMC.findMany();

export const getById = async (id: string) =>
  prisma.pMC.findFirstOrThrow({
    where: {
      id,
    },
  });

export const create = async (name: string) =>
  prisma.pMC.create({
    data: {
      name,
    },
  });
