import prisma from "@config/db";
import { UpdateFile } from "@models/file";

export const getList = async (take: number, skip: number) =>
  prisma.file.findMany({
    take,
    skip,
  });

export const getCount = async () => prisma.file.count();

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
