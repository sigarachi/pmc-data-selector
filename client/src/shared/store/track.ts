import type { Marker } from '@shared/api/models/marker';
import { create } from 'zustand';

export interface TackStore {
	markers: Array<Marker>;
	setMarkers: (markers: Array<Marker>) => void;
	reset: VoidFunction;
}

const initialState: Pick<TackStore, 'markers'> = {
	markers: [],
};

export const useTrack = create<TackStore>()((set) => ({
	...initialState,
	setMarkers: (markers: Array<Marker>) => set(() => ({ markers })),
	reset: () => set(initialState),
}));
