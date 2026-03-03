import { useCoords } from '@shared/store/coords';
import { useMapEvents } from 'react-leaflet';

export const useCoordsObserver = () => {
	const { setCoords } = useCoords();

	useMapEvents({
		//@ts-ignore
		mousemove: (e) => {
			setCoords({
				lat: e.latlng.lat,
				lng: e.latlng.lng,
			});
		},
	});
};
