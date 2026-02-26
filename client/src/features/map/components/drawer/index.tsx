import { useCallback, useEffect, useState } from "react";
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
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState<{
    active: boolean;
    index: number | null;
  }>({
    active: false,
    index: null,
  });

  const { updatePolygons, currentMarker } = useDraw();

  const map = useMapEvents({
    //@ts-ignore
    click: (e) => {
      if (currentMarker) {
        let newPositions: Array<Array<number>> = [];
        if (currentMarker.type === "poly") {
          newPositions = [...positions, [e.latlng.lat, e.latlng.lng]];
        }
        if (currentMarker.type === "point") {
          newPositions = [[e.latlng.lat, e.latlng.lng]];
        }
        updatePolygons(newPositions);
        setPositions(newPositions);
      }
    },
    //@ts-ignore
    mousemove: (e) => {
      if (dragging.active && dragging.index !== null) {
        const newPositions = [...positions];
        newPositions[dragging.index] = [e.latlng.lat, e.latlng.lng];
        updatePolygons(newPositions);
        setPositions(newPositions);

        map.dragging.disable();
      }
    },
    mouseup: () => {
      if (dragging.active) {
        setDragging({ active: false, index: null });

        map.dragging.enable();
      }
    },
  });

  const handleMouseDown = useCallback((index: number, e: unknown) => {
    //@ts-ignore
    e.originalEvent.stopPropagation();
    //@ts-ignore
    e.originalEvent.preventDefault();

    setDragging({
      active: true,
      index: index,
    });

    map.dragging.disable();
  }, []);

  const handleDelete = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "Delete" && selected) {
        const newPositions = [...positions];
        newPositions.splice(selected, 1);
        updatePolygons(newPositions);
        setPositions(newPositions);
        setSelected(null);
      }
    },
    [positions, selected, updatePolygons],
  );

  useEffect(() => {
    if (currentMarker) {
      setPositions(currentMarker.polygons);
    } else {
      setPositions([]);
    }
  }, [currentMarker]);

  useEffect(() => {
    window.addEventListener("keydown", handleDelete);

    return () => {
      window.removeEventListener("keydown", handleDelete);
    };
  }, [handleDelete]);

  return (
    <>
      {currentMarker && (
        <>
          {currentMarker.type === "poly" && (
            <>
              <Polygon positions={positions} />
              {positions.map((pos, index) => (
                <Circle
                  key={index}
                  center={pos}
                  radius={5000}
                  eventHandlers={{
                    //@ts-ignore
                    mousedown: (e) => handleMouseDown(index, e),
                    click: () => setSelected(index),
                  }}
                >
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
