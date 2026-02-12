import React, { useEffect, useState } from "react";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ParamService } from "@shared/api/services/param";
import type { ParamFilters } from "@shared/api/models/param";
import { getRandomColor } from "@shared/utils/get-random-color";
import { options } from "@shared/config";

export const MyMap = (): React.ReactElement => {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();

  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [variable, setVariable] = useState<string>("");
  const [pressure, setPressure] = useState<string>("");

  const [filters] = useState<ParamFilters["filters"]>([
    { field: "type", condition: "equals", value: "coords" },
  ]);

  const { data } = useQuery({
    queryKey: ["pmc-params", id, filters],
    queryFn: () => ParamService.getList(id, { filters: filters }),
    enabled: Boolean(id.length),
  });

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
    <div>
      <MapContainer
        center={[75, 60]}
        zoom={5}
        minZoom={1}
        maxZoom={13}
        style={{ height: "100vh", width: "100%", zIndex: "1" }}
        key={new Date().getTime()}
      >
        <TileLayer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <TileLayer
          opacity={0.7}
          url={`${options.apiUrl}/netcdf-api/tile/{z}/{x}/{y}?${new URLSearchParams(
            {
              variable: variable,
              time: `${date} ${time}`,
              pressure_level: pressure,
            },
          )}`}
        />
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
      </MapContainer>
    </div>
  );
};
