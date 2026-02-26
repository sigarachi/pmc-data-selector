import { MarkerType } from "@prisma/client";

export type CreateMarkerDto = {
  layerId: string;
  name: string;
  type: MarkerType;
  polygons: string;
};
