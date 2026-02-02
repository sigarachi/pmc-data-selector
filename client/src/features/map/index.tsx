import React from "react";

import { MapContainer, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

export const MyMap = (): React.ReactElement => {
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
      </MapContainer>
    </div>
  );
};
