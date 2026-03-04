import prisma from "@config/db";
import { CreateParamDto } from "../models/param";
import { DbFilter } from "../models/common";

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

export const create = async (pmcId: string, values: CreateParamDto) =>
  prisma.param.create({
    data: {
      ...values,
      pmcId,
    },
  });
