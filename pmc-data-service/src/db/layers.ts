import prisma from "@config/db";
import { CreateLayerDto } from "@models/layer";

export const getList = async (pmcId: string) =>
  prisma.layer.findMany({
    where: {
      pmcId,
    },
  });

export const getAll = async () =>
  prisma.$queryRaw`SELECT l.name as layer_name, l.date as layer_date, m.type as marker_type, m.polygons as marker_polygons, p.name as pmc_name, p."dateTime" as pmc_dateTime  FROM public."Layer" l INNER JOIN public."Marker" m ON l.id = m."layerId" INNER JOIN public."PMC" p ON p.id = l."pmcId" `;

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
