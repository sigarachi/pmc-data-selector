import { create } from 'zustand';

export interface ReminderState {
	isOpen: boolean;
	toggleOpen: (value: boolean) => void;
}

export const initialState: Pick<ReminderState, 'isOpen'> = {
	isOpen: false,
};

export const useReminder = create<ReminderState>()((set) => ({
	...initialState,
	toggleOpen: (value) => set(() => ({ isOpen: value })),
}));
