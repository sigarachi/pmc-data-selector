import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleMarker, Polygon, useMapEvents } from 'react-leaflet';
import { useDraw } from '@shared/store/draw';

export const Drawer = () => {
	const [positions, setPositions] = useState<Array<Array<number>>>([]);
	const [selected, setSelected] = useState<number | null>(null);
	const [dragging, setDragging] = useState<{
		active: boolean;
		index: number | null;
	}>({
		active: false,
		index: null,
	});

	const startLatLngRef = useRef(null);

	const { updatePolygons, currentMarker, cursor } = useDraw();

	const map = useMapEvents({
		//@ts-ignore
		mousedown: (e) => {
			if (currentMarker && cursor === 'create') {
				let newPositions: Array<Array<number>> = [];
				if (currentMarker.type === 'poly') {
					newPositions = [...positions, [e.latlng.lat, e.latlng.lng]];
				}
				if (currentMarker.type === 'point') {
					newPositions = [[e.latlng.lat, e.latlng.lng]];
				}
				updatePolygons(newPositions);
				setPositions(newPositions);
			}
		},
		//@ts-ignore
		mousemove: (e) => {
			if (dragging.active && cursor === 'drag') {
				if (startLatLngRef.current && !dragging.index) {
					const start = startLatLngRef.current;
					const current = e.latlng;

					//@ts-ignore
					const deltaLat = current.lat - start.lat;
					//@ts-ignore
					const deltaLng = current.lng - start.lng;

					if (Math.abs(deltaLat) < 0.000001 && Math.abs(deltaLng) < 0.000001) {
						return;
					}

					const newPositions = positions.map((value) => [
						value[0] + deltaLat,
						value[1] + deltaLng,
					]);

					updatePolygons(newPositions);
					setPositions(newPositions);
					startLatLngRef.current = current;
					return;
				}

				const newPositions = [...positions];
				if (dragging.index) {
					newPositions[dragging.index] = [e.latlng.lat, e.latlng.lng];
					updatePolygons(newPositions);
					setPositions(newPositions);
				}

				map.dragging.disable();
			}
		},
		mouseup: () => {
			if (dragging.active) {
				setDragging({ active: false, index: null });

				map.dragging.enable();
			}
		},
	});

	const handleMouseDown = useCallback((e: unknown, index?: number) => {
		//@ts-ignore
		e.originalEvent.stopPropagation();
		//@ts-ignore
		e.originalEvent.preventDefault();

		setDragging({
			active: true,
			index: index ?? null,
		});

		map.dragging.disable();
	}, []);

	const handleDelete = useCallback(
		(event: KeyboardEvent) => {
			const key = event.key;

			if (key === 'Delete' && selected) {
				const newPositions = [...positions];
				newPositions.splice(selected, 1);
				updatePolygons(newPositions);
				setPositions(newPositions);
				setSelected(null);
			}
		},
		[positions, selected, updatePolygons]
	);

	useEffect(() => {
		if (currentMarker) {
			setPositions(currentMarker.polygons);
		} else {
			setPositions([]);
		}
	}, [currentMarker]);

	useEffect(() => {
		window.addEventListener('keydown', handleDelete);

		return () => {
			window.removeEventListener('keydown', handleDelete);
		};
	}, [handleDelete]);

	return (
		<>
			{currentMarker && (
				<>
					{currentMarker.type === 'poly' && (
						<>
							<Polygon
								positions={positions}
								pathOptions={{ color: 'black', weight: 5 }}
								eventHandlers={{
									//@ts-ignore
									mousedown: (e) => {
										handleMouseDown(e);
										startLatLngRef.current = e.latlng;
									},
								}}
							/>
							{positions.map((pos, index) => (
								<CircleMarker
									key={index}
									center={{ lat: pos[0], lng: pos[1] }}
									radius={5}
									pathOptions={{
										color: 'black',
										fillColor: 'black',
										fillOpacity: 1,
										weight: 2,
									}}
									eventHandlers={{
										//@ts-ignore
										mousedown: (e) => handleMouseDown(e, index),
										click: () => setSelected(index),
									}}></CircleMarker>
							))}
						</>
					)}
					{currentMarker.type === 'point' && positions.length && (
						<CircleMarker
							center={positions[0]}
							pathOptions={{ color: 'green' }}
						/>
					)}
				</>
			)}
		</>
	);
};
