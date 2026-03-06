import { ColorLegend } from '@features/controls/components/palette';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Buttons } from './components/buttons';
import { BottomWrapperStyled } from './controls.style';
import { Timeline } from './components/timeline';
import { useInitControls } from './hooks/use-init-controls';
import { Coords } from '@features/map/components/coords';
import { useEffect } from 'react';
import { useScale } from '@shared/store/scale';
import { DatasetType } from './components/dataset-type';

export const Controls = () => {
	const [searchParams] = useSearchParams();
	const { reset } = useScale();

	const hideTimeLine =
		!searchParams.get('showTimeline') ||
		searchParams.get('showTimeline') === 'false';

	const hideLegend =
		!searchParams.get('showLegend') ||
		searchParams.get('showLegend') === 'false';

	useInitControls();

	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	return (
		<>
			<Buttons />
			<Outlet />
			<BottomWrapperStyled>
				{!hideLegend && <ColorLegend />}
				<DatasetType />
				<Coords />
				{!hideTimeLine && <Timeline />}
			</BottomWrapperStyled>
		</>
	);
};
