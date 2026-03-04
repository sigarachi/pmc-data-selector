import type React from 'react';
import type { UseVminVmaxForm } from './hooks/use-vmin-vmax-form';
import { Input } from '@university-ecosystem/ui-kit';
import { Controller } from 'react-hook-form';

export const Form: React.FC<UseVminVmaxForm> = ({ control, handleSubmit }) => {
	return (
		<>
			<Controller
				control={control}
				name="vmin"
				render={({ field }) => (
					<Input
						value={field.value}
						variant="fullwidth"
						placeholder="min"
						//@ts-ignore
						onChange={field.onChange}
					/>
				)}
			/>
			<Controller
				control={control}
				name="vmax"
				render={({ field }) => (
					<Input
						value={field.value}
						variant="fullwidth"
						placeholder="max"
						//@ts-ignore
						onChange={field.onChange}
					/>
				)}
			/>
		</>
	);
};
