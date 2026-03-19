import prisma from "@config/db";
import { UpdateFile } from "@models/file";

export const getList = async () => prisma.file.findMany();

export const getById = async (id: string) =>
  prisma.file.findFirstOrThrow({
    where: {
      id,
    },
  });

export const create = async (name: string) =>
  prisma.file.create({
    data: {
      name,
    },
  });

export const updateInfo = async (id: string, values: UpdateFile) =>
  prisma.file.update({
    where: {
      id,
    },
    data: {
      ...values,
    },
  });
