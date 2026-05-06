import { create } from 'zustand';

export type TabValue = 'layer' | 'data' | 'track';

export interface TabStore {
	tab: TabValue;
	setTab: (tab: TabValue) => void;
	reset: VoidFunction;
}

const initialState: Pick<TabStore, 'tab'> = {
	tab: 'data',
};

export const useTabs = create<TabStore>()((set) => ({
	...initialState,
	setTab: (tab: TabValue) => set(() => ({ tab })),
	reset: () => set(initialState),
}));
