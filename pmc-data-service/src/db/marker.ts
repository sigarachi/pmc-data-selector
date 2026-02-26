import prisma from "@config/db";
import { CreateMarkerDto } from "../models/marker";

export const getList = async (layerId: string) =>
  prisma.marker.findMany({
    where: {
      layerId,
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
