import { useTrack } from '@shared/store/track';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { CircleMarker, Polygon, Polyline, Popup } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';

export const TrackView = () => {
	const [searchParams] = useSearchParams();

	const { markers } = useTrack();

	const showPoly = searchParams.get('showPoly') === 'true';

	const pointsPositions = useMemo(
		() =>
			markers
				.filter((item) => item.type === 'point')
				.map((item) => (item.polygons.length ? item.polygons[0] : []))
				.filter((item) => item.length)
				.filter(Boolean),
		[markers]
	);

	return (
		<>
			{markers.length &&
				markers.map((marker) => (
					<>
						{marker.type === 'point' && marker.polygons.length && (
							<CircleMarker
								//@ts-ignore
								center={marker.polygons[0]}
								pathOptions={{
									color: 'green',
									fillColor: 'green',
									fillOpacity: 1,
								}}>
								<Popup>
									Дата/время: {format(marker.dateTime, 'dd/MM/yyyy HH:mm')}
								</Popup>
							</CircleMarker>
						)}
						{showPoly && marker.type === 'poly' && (
							<>
								{marker.polygons.length && (
									<Polygon
										//@ts-ignore
										positions={marker.polygons}
										pathOptions={{ color: 'black', weight: 5 }}
									/>
								)}

								{marker.polygons.map((pos, i) => (
									<CircleMarker
										key={i}
										center={{ lat: pos[0], lng: pos[1] }}
										radius={6}
										pathOptions={{
											color: 'black',
											fillColor: 'black',
											fillOpacity: 1,
											weight: 2,
										}}
									/>
								))}
							</>
						)}
					</>
				))}
			{pointsPositions.length && (
				<Polyline
					//@ts-ignore
					positions={pointsPositions}
					pathOptions={{ color: 'black', weight: 5 }}
				/>
			)}
		</>
	);
};
