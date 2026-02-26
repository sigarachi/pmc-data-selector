import { useEffect, useState } from "react";
import {
  Circle,
  CircleMarker,
  Polygon,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { useDraw } from "@shared/store/draw";

export const Drawer = () => {
  const [positions, setPositions] = useState<Array<Array<number>>>([]);

  const { updatePolygons, currentMarker } = useDraw();

  useMapEvents({
    //@ts-ignore
    click: (e) => {
      if (currentMarker) {
        let newPositions: Array<Array<number>> = [];
        if (currentMarker.type === "polygon") {
          newPositions = [...positions, [e.latlng.lat, e.latlng.lng]];
        }
        if (currentMarker.type === "point") {
          newPositions = [[e.latlng.lat, e.latlng.lng]];
        }
        updatePolygons(newPositions);
        setPositions(newPositions);
      }
    },
  });

  useEffect(() => {
    if (currentMarker) {
      setPositions(currentMarker.polygons);
    } else {
      setPositions([]);
    }
  }, [currentMarker]);

  return (
    <>
      {currentMarker && (
        <>
          {currentMarker.type === "polygon" && (
            <>
              <Polygon positions={positions} />
              {positions.map((pos, index) => (
                <Circle key={index} center={pos} radius={200}>
                  <Popup>
                    Вершина {index + 1}
                    <br />
                    Координаты: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
                  </Popup>
                </Circle>
              ))}
            </>
          )}
          {currentMarker.type === "point" && positions.length && (
            <CircleMarker
              center={positions[0]}
              pathOptions={{ color: "green" }}
            />
          )}
        </>
      )}
    </>
  );
};
