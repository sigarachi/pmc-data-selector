import { create } from 'zustand';

export interface Coords {
	lat: number;
	lng: number;
}

export interface CoordsStore {
	coords: Coords;
	setCoords: (coords: Coords) => void;
}

export const useCoords = create<CoordsStore>()((set) => ({
	setCoords: (coords) => set({ coords }),
	coords: {
		lat: 0,
		lng: 0,
	},
}));
