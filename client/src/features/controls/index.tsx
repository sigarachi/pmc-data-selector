import { ColorLegend } from '@features/controls/components/palette';
import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Buttons } from './components/buttons';
import { BottomWrapperStyled } from './controls.style';
import { Timeline } from './components/timeline';
import { useInitControls } from './hooks/use-init-controls';

export const Controls = () => {
	const [pressure, setPressure] = useState('850');
	const [variable, setVariable] = useState<string>('z');

	const [searchParams] = useSearchParams();

	const hideTimeLine =
		!searchParams.get('showTimeline') ||
		searchParams.get('showTimeline') === 'false';

	const hideLegend =
		!searchParams.get('showLegend') ||
		searchParams.get('showLegend') === 'false';

	useEffect(() => {
		const searchVariable = searchParams.get('variable');
		const searchPressure = searchParams.get('pressure');

		if (searchVariable) {
			setVariable(searchVariable);
		}
		if (searchPressure) {
			setPressure(searchPressure);
		}
	}, [variable, pressure, searchParams]);

	useInitControls();

	return (
		<>
			<Buttons />
			<Outlet />
			<BottomWrapperStyled>
				{!hideLegend && (
					<ColorLegend pressure={Number(pressure)} variable={variable} />
				)}
				{!hideTimeLine && <Timeline />}
			</BottomWrapperStyled>
		</>
	);
};
