import prisma from "@config/db";
import { CreateLayerDto } from "../models/layer";

export const getList = async (pmcId: string) =>
  prisma.layer.findMany({
    where: {
      pmcId,
    },
  });

export const getById = async (id: string) =>
  prisma.layer.findFirstOrThrow({ where: { id } });

export const create = async (args: CreateLayerDto) =>
  prisma.layer.create({
    data: args,
  });

export const deleteLayer = async (id: string) =>
  prisma.layer.delete({
    where: {
      id,
    },
  });
