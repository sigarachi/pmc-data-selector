import { create } from 'zustand';

export type Variables = 'z' | 'u' | 'u10';

export interface VariableValue {
	vmin: string;
	vmax: string;
}

export type ScaleStoreVars = {
	[key in Variables]: VariableValue;
};

export type ScaleStore = ScaleStoreVars & {
	setValues: (key: Variables, values: VariableValue) => void;
	reset: () => void;
};

export const initivalValue = {
	vmin: '',
	vmax: '',
};

const initialState: ScaleStoreVars = {
	z: initivalValue,
	u: initivalValue,
	u10: initivalValue,
};

export const useScale = create<ScaleStore>()((set) => ({
	...initialState,
	setValues: (key: Variables, values: VariableValue) =>
		set(() => ({ [key]: values })),
	reset: () => set(initialState),
}));
