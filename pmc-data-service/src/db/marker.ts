import prisma from "@config/db";
import { DbFilter } from "@models/common";
import { CreateMarkerDto } from "@models/marker";

export const getList = async (
  pmcId: string,
  filters: DbFilter<Omit<CreateMarkerDto, "polygons">>,
) =>
  prisma.marker.findMany({
    where: {
      pmcId,
      ...filters,
    },
    orderBy: {
      type: "asc",
    },
  });

export const getAll = async (
  filters: DbFilter<Pick<CreateMarkerDto, "pmcId">>,
) =>
  prisma.marker.findMany({
    where: {
      ...filters,
    },
    select: {
      dateTime: true,
      pmcId: true,
      polygons: true,
      name: true,
      pmc: {
        select: {
          name: true,
          dateTime: true,
        },
      },
    },
  });

export const getById = async (id: string) =>
  prisma.marker.findFirstOrThrow({
    where: {
      id,
    },
  });

export const deleteMarker = async (id: string) =>
  prisma.marker.delete({
    where: {
      id,
    },
  });

export const create = async (values: CreateMarkerDto) =>
  prisma.marker.create({
    data: values,
  });

export const update = async (id: string, values: Partial<CreateMarkerDto>) =>
  prisma.marker.update({
    where: {
      id,
    },
    data: values,
  });
