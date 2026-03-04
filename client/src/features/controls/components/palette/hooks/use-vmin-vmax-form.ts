import { useCallback } from 'react';
import { useForm, type Control } from 'react-hook-form';

export interface VminVmaxInputs {
	vmin: string;
	vmax: string;
}

export interface UseVminVmaxForm {
	control: Control<VminVmaxInputs>;
	handleSubmit: () => void;
}

export const useVminVmaxForm = (
	onSubmit: (values: VminVmaxInputs) => void
): UseVminVmaxForm => {
	const { control, handleSubmit } = useForm<VminVmaxInputs>();

	const handleFormSubmit = useCallback(() => {
		void handleSubmit(onSubmit)();
	}, [onSubmit, handleSubmit]);

	return {
		control,
		handleSubmit: handleFormSubmit,
	};
};
