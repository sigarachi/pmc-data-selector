import type { Marker, MarkerType } from "@shared/api/models/marker";
import { create } from "zustand";

export type StoreMarker = Omit<Marker, "id"> & {
  id?: string;
};

export interface DrawStore {
  brush: MarkerType;
  markers: StoreMarker[];
  currentMarkerIdx: number | null;
  currentMarker?: StoreMarker;
}

export interface DrawActions {
  changeBrush: (brush: MarkerType) => void;
  addMarker: (marker: StoreMarker) => void;
  setCurrentMarker: (index?: number) => void;
  updatePolygons: (polygons: Array<Array<number>>) => void;
  removeMarker: (index: number) => void;
  setMarkers: (markers: Array<StoreMarker>) => void;
  reset: () => void;
}

const initialState: DrawStore = {
  brush: "point",
  markers: [],
  currentMarkerIdx: null,
  currentMarker: undefined,
};

export const useDraw = create<DrawStore & DrawActions>()((set) => ({
  ...initialState,
  changeBrush: (brush) => set(() => ({ brush })),
  addMarker: (marker) =>
    set((state) => ({ markers: [...state.markers, marker] })),
  setMarkers: (markers) => set(() => ({ markers })),
  setCurrentMarker: (index) =>
    set((state) => {
      if (isNaN(Number(index))) {
        return { currentMarkerIdx: null, currentMarker: undefined };
      }

      return {
        currentMarkerIdx: index,
        currentMarker: state.markers[Number(index)],
      };
    }),
  removeMarker: (index) =>
    set((state) => {
      const { markers } = state;

      markers.splice(index, 1);

      return {
        markers,
      };
    }),

  updatePolygons: (polygons) =>
    set((state) => {
      const { markers, currentMarkerIdx } = state;

      if (isNaN(Number(currentMarkerIdx))) {
        return {};
      }

      const currentMarker = markers[Number(currentMarkerIdx)];

      currentMarker.polygons = polygons;

      markers[Number(currentMarkerIdx)] = currentMarker;
      return {
        markers,
      };
    }),
  reset: () => set(initialState),
}));
