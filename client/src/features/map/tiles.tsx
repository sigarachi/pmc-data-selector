import type { ParamFilters } from "@shared/api/models/param";
import { ParamService } from "@shared/api/services/param";
import { Loader } from "@shared/components/loader";
import { options } from "@shared/config";
import { getRandomColor } from "@shared/utils/get-random-color";
import { useQuery } from "@tanstack/react-query";
import { useToggle } from "@university-ecosystem/ui-kit";
import { useEffect, useState } from "react";
import { CircleMarker, Popup, TileLayer } from "react-leaflet";
import { useParams, useSearchParams } from "react-router-dom";

export const Tiles = () => {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();

  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [variable, setVariable] = useState<string>("");
  const [pressure, setPressure] = useState<string>("250");

  const [filters] = useState<ParamFilters["filters"]>([
    { field: "type", condition: "equals", value: "coords" },
  ]);

  const { data } = useQuery({
    queryKey: ["pmc-params", id, filters],
    queryFn: () => ParamService.getList(id, { filters: filters }),
    enabled: Boolean(id.length),
  });

  const { flag: isLoading, toggleOn, toggleOff } = useToggle();

  useEffect(() => {
    const searchTime = searchParams.get("time");
    const searchDate = searchParams.get("date");
    const searchVariable = searchParams.get("variable");
    const searchPressure = searchParams.get("pressure");
    if (searchTime) {
      setTime(searchTime);
    }
    if (searchDate) {
      setDate(searchDate);
    }
    if (searchVariable) {
      setVariable(searchVariable);
    }
    if (searchPressure) {
      setPressure(searchPressure);
    }
  }, [searchParams]);

  return (
    <>
      {isLoading && <Loader />}
      <TileLayer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
      {variable && (
        <TileLayer
          opacity={0.7}
          eventHandlers={{
            loading: toggleOn,
            load: toggleOff,
          }}
          url={`${options.apiUrl}/netcdf-api/tile/{z}/{x}/{y}?${new URLSearchParams(
            {
              variable: variable,
              time: `${date} ${time}`,
              pressure_level: pressure,
            },
          )}`}
        />
      )}
      {data?.params &&
        data.params.map((item) => (
          <>
            {item.value && (
              <CircleMarker
                center={item.value.trim().split(",").reverse()}
                pathOptions={{
                  fillColor: getRandomColor(),
                }}
              >
                <Popup>{item.name}</Popup>
              </CircleMarker>
            )}
          </>
        ))}
    </>
  );
};
