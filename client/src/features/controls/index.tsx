import { ColorLegend } from '@features/controls/components/palette';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Buttons } from './components/buttons';
import { BottomWrapperStyled } from './controls.style';
import { Timeline } from './components/timeline';
import { useInitControls } from './hooks/use-init-controls';
import { Coords } from '@features/map/components/coords';

export const Controls = () => {
	const [searchParams] = useSearchParams();

	const hideTimeLine =
		!searchParams.get('showTimeline') ||
		searchParams.get('showTimeline') === 'false';

	const hideLegend =
		!searchParams.get('showLegend') ||
		searchParams.get('showLegend') === 'false';

	useInitControls();

	return (
		<>
			<Buttons />
			<Outlet />
			<BottomWrapperStyled>
				{!hideLegend && <ColorLegend />}
				<Coords />
				{!hideTimeLine && <Timeline />}
			</BottomWrapperStyled>
		</>
	);
};
