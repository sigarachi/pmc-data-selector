import { create } from "zustand";

export type Brush = "point" | "polygon";

export type Marker = {
  type: Brush;
  polygons: Array<Array<number>>;
};

export interface DrawStore {
  brush: Brush;
  markers: Marker[];
  currentMarkerIdx: number | null;
  currentMarker?: Marker;
}

export interface DrawActions {
  changeBrush: (brush: Brush) => void;
  addMarker: (marker: Marker) => void;
  setCurrentMarker: (index?: number) => void;
  updatePolygons: (polygons: Array<Array<number>>) => void;
  removeMarker: (index: number) => void;
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
