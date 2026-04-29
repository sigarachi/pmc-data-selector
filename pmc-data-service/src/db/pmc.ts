import prisma from "@config/db";
import { DbFilter } from "@models/common";
import { UpdatePmcDto } from "@models/pmc";

export const getList = async (
  take: number,
  skip: number,
  filters: DbFilter<{ name: string }>,
) =>
  prisma.pMC.findMany({
    take,
    skip,
    where: {
      ...filters,
    },
    orderBy: {
      dateTime: "asc",
    },
  });

export const getCount = async () => prisma.pMC.count();

export const getById = async (id: string) =>
  prisma.pMC.findFirstOrThrow({
    where: {
      id,
    },
  });

export const getByName = async (name: string) =>
  prisma.pMC.findFirst({
    where: {
      name,
    },
  });

export const create = async (name: string) =>
  prisma.pMC.create({
    data: {
      name,
    },
  });

export const update = async (id: string, values: UpdatePmcDto) =>
  prisma.pMC.update({ where: { id }, data: values });
