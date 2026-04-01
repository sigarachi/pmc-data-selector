import { LayerWrapperStyled } from './layer.style';
import { DrawControls } from '@features/draw-controls';

export const LayerData = () => {
	return (
		<LayerWrapperStyled>
			<DrawControls />
		</LayerWrapperStyled>
	);
};
