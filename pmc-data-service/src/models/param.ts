import { ParamType } from "@prisma/client";
import { FilteredRequest } from "./common";

export type CreateParamDto = {
  name: string;
  value: string;
  type: ParamType;
};

export type ParamFilters = FilteredRequest<
  CreateParamDto,
  "name" | "type" | "value"
>;

export type CsvParamName =
  | "datetime_formation"
  | "datetime_death"
  | "formation_coords"
  | "radius_km"
  | "death_coords";

export const CsvParamNameMap: Record<CsvParamName, string> = {
  datetime_formation: "Дата/Время формирования",
  datetime_death: "Дата/Время расформирования",
  formation_coords: "Координаты формирования",
  radius_km: "Радиус",
  death_coords: "Координаты расформирования",
};
