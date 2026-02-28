import React from "react";

import { MapContainer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { Tiles } from "./tiles";
import { Outlet } from "react-router-dom";

export const MyMap = (): React.ReactElement => {
  return (
    <div>
      <MapContainer
        center={[75, 60]}
        zoom={3}
        minZoom={1}
        maxZoom={13}
        style={{ height: "100vh", width: "100%", zIndex: "10" }}
        key={new Date().getTime()}
      >
        <Tiles />
        <Outlet />
      </MapContainer>
    </div>
  );
};
