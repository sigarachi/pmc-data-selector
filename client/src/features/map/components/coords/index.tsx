import { useState } from 'react';
import { useMapEvents } from 'react-leaflet';
import type { CoordsRef } from './interfaces';
import { CoordsWrapperStyled } from './coords.style';
import { Text } from '@university-ecosystem/ui-kit';

export const Coords = () => {
	const [coords, setCoords] = useState<CoordsRef | null>(null);

	useMapEvents({
		//@ts-ignore

		//@ts-ignore
		mousemove: (e) => {
			setCoords({
				lat: e.latlng.lat,
				lng: e.latlng.lng,
			});
		},
	});

	if (!coords) {
		return <></>;
	}

	return (
		<CoordsWrapperStyled>
			<>
				<Text variant="body2">{coords.lat}</Text>
				<Text variant="body2">{coords.lng}</Text>
			</>
		</CoordsWrapperStyled>
	);
};
