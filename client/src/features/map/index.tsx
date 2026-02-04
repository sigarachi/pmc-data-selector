import React, { useState } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ParamService } from "@shared/api/services/param";
import type { ParamFilters } from "@shared/api/models/param";
import { getRandomColor } from "@shared/utils/get-random-color";

export const MyMap = (): React.ReactElement => {
  const { id = "" } = useParams();

  const [filters, setFilters] = useState<ParamFilters["filters"]>([
    { field: "type", condition: "equals", value: "coords" },
  ]);

  const { data } = useQuery({
    queryKey: ["pmc-params", id, filters],
    queryFn: () => ParamService.getList(id, { filters: filters }),
    enabled: Boolean(id.length),
  });

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
        {data?.params &&
          data.params.map((item) => (
            <CircleMarker
              center={item.value.trim().split(",").reverse()}
              pathOptions={{
                fillColor: getRandomColor(),
              }}
            >
              <Popup>{item.name}</Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
};
