import prisma from "@config/db";
import { CreateParamDto } from "../models/param";

export const getList = async (pmcId: string) =>
  prisma.param.findMany({
    where: {
      pmcId,
    },
  });

export const create = async (pmcId: string, values: CreateParamDto) =>
  prisma.param.create({
    data: {
      ...values,
      pmcId,
    },
  });
