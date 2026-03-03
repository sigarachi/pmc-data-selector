import { CoordsWrapperStyled } from './coords.style';
import { Text } from '@university-ecosystem/ui-kit';
import { useCoords } from '@shared/store/coords';

export const Coords = () => {
	const { coords } = useCoords();

	return (
		<CoordsWrapperStyled>
			<>
				<Text variant="body2">{coords.lat}</Text>
				<Text variant="body2">{coords.lng}</Text>
			</>
		</CoordsWrapperStyled>
	);
};
