import prisma from "@config/db";
import { DbFilter } from "@models/common";
import { CreateFileDto, UpdateFile } from "@models/file";

export const getList = async (
  take: number,
  skip: number,
  filters: DbFilter<UpdateFile>,
) =>
  prisma.file.findMany({
    take,
    skip,
    where: {
      ...filters,
    },
  });

export const getCount = async () => prisma.file.count();

export const getById = async (id: string) =>
  prisma.file.findFirstOrThrow({
    where: {
      id,
    },
  });

export const getByFilters = async (filters: DbFilter<UpdateFile>) =>
  prisma.file.findFirst({ where: { ...filters } });

export const create = async (values: CreateFileDto) =>
  prisma.file.create({
    data: {
      ...values,
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
