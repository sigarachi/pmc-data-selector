import prisma from "@config/db";
import { CreateParamDto } from "@models/param";
import { DbFilter } from "@models/common";

export const getList = async (
  pmcId: string,
  filters: DbFilter<CreateParamDto>,
) =>
  prisma.param.findMany({
    where: {
      pmcId,
      ...filters,
    },
    orderBy: [{ name: "desc" }, { title: "asc" }],
  });

export const getAll = async (filters: DbFilter<{ pmcId: string }>) =>
  prisma.param.findMany({
    where: {
      ...filters,
    },
    select: {
      pmcId: true,
      title: true,
      name: true,
      value: true,
      pmc: {
        select: {
          name: true,
          dateTime: true,
        },
      },
    },
    orderBy: {
      pmcId: "desc",
    },
  });

export const create = async (pmcId: string, values: CreateParamDto) =>
  prisma.param.create({
    data: {
      ...values,
      pmcId,
    },
  });
