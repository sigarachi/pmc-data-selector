import type { Marker, MarkerType } from '@shared/api/models/marker';
import { create } from 'zustand';

export type StoreMarker = Omit<Marker, 'id'> & {
	id?: string;
};

export type CursorType = 'drag' | 'create';

export interface DrawStore {
	brush: MarkerType;
	markers: StoreMarker[];
	cursor: CursorType;
	currentMarkerIdx: number | null;
	currentMarker?: StoreMarker;
}

export interface DrawActions {
	changeBrush: (brush: MarkerType) => void;
	addMarker: (marker: StoreMarker) => StoreMarker;
	setCurrentMarker: (index?: number) => void;
	setCursor: (cursor: CursorType) => void;
	updatePolygons: (polygons: Array<Array<number>>) => void;
	removeMarker: (index: number) => void;
	setMarkers: (markers: Array<StoreMarker>) => void;
	reset: () => void;
}

const initialState: DrawStore = {
	brush: 'point',
	cursor: 'create',
	markers: [],
	currentMarkerIdx: null,
	currentMarker: undefined,
};

export const useDraw = create<DrawStore & DrawActions>()((set) => ({
	...initialState,
	changeBrush: (brush) => set(() => ({ brush })),
	addMarker: (marker) => {
		set((state) => ({ markers: [...state.markers, marker] }));
		return marker;
	},
	setMarkers: (markers) => set(() => ({ markers })),
	setCursor: (cursor) => set(() => ({ cursor })),
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
				markers: markers.filter((_, i) => i !== index),
			};
		}),

	updatePolygons: (polygons) =>
		set((state) => {
			const { markers, currentMarkerIdx } = state;

			if (isNaN(Number(currentMarkerIdx))) {
				return {};
			}

			const idx = Number(currentMarkerIdx);

			const updatedMarker = {
				...markers[idx],
				polygons,
			};

			const updatedMarkers = [...markers];
			updatedMarkers[idx] = updatedMarker;

			return {
				markers: updatedMarkers,
				currentMarker: updatedMarker,
			};
		}),
	reset: () => set(initialState),
}));
