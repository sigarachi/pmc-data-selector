import React from 'react';
import type { ComponentType } from 'react';
import { Navigation } from '@shared/components/navigation';
import { LayoutFullWindow } from '@university-ecosystem/ui-kit';

type WithNavigation<T> = {
	hideMenuOptions?: boolean;
	active?: boolean;
} & T;

export const withNavigation = <T,>(
	Component: ComponentType<WithNavigation<T>>
) => {
	return (props: WithNavigation<T>): React.ReactElement => {
		return (
			<LayoutFullWindow>
				<Navigation />
				<Component {...props} />
			</LayoutFullWindow>
		);
	};
};
