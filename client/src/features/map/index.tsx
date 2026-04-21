import React from 'react';

import { MapContainer } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import { Tiles } from './tiles';
import { MapWrapper } from './style';

export const MyMap = (): React.ReactElement => {
	return (
		<MapWrapper>
			<MapContainer
				center={[75, 60]}
				zoom={3}
				minZoom={1}
				maxZoom={13}
				doubleClickZoom={false}
				boxZoom={false}
				style={{ height: '100%', width: '100%', zIndex: '1' }}>
				<Tiles />
			</MapContainer>
		</MapWrapper>
	);
};
