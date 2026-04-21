import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleMarker, Polygon, useMap, useMapEvents } from 'react-leaflet';
import { useDraw } from '@shared/store/draw';

export const Drawer = () => {
	const { currentMarker, updatePolygons } = useDraw();

	const [positions, setPositions] = useState<number[][]>([]);

	const positionsRef = useRef<number[][]>([]);
	const draggingRef = useRef<{ active: boolean; index: number | null }>({
		active: false,
		index: null,
	});
	const isDraggingRef = useRef(false);
	const startRef = useRef<{ lat: number; lng: number } | null>(null);

	const map = useMap();

	useEffect(() => {
		if (currentMarker?.polygons) {
			setPositions(currentMarker.polygons);
			positionsRef.current = currentMarker.polygons;
		} else {
			setPositions([]);
			positionsRef.current = [];
		}
	}, [currentMarker]);

	useMapEvents({
		click(e) {
			if (isDraggingRef.current) return;

			if (!currentMarker) return;

			const newPoint = [e.latlng.lat, e.latlng.lng];

			let newPositions: number[][] = [];

			if (currentMarker.type === 'poly') {
				newPositions = [...positionsRef.current, newPoint];
			}

			if (currentMarker.type === 'point') {
				newPositions = [newPoint];
			}

			positionsRef.current = newPositions;
			setPositions(newPositions);
			updatePolygons(newPositions);
		},

		mousemove(e) {
			if (!draggingRef.current.active) return;

			isDraggingRef.current = true;

			const { index } = draggingRef.current;

			if (index === null && startRef.current) {
				const deltaLat = e.latlng.lat - startRef.current.lat;
				const deltaLng = e.latlng.lng - startRef.current.lng;

				const newPositions = positionsRef.current.map(([lat, lng]) => [
					lat + deltaLat,
					lng + deltaLng,
				]);

				positionsRef.current = newPositions;
				startRef.current = e.latlng;

				setPositions(newPositions);
				return;
			}

			if (index !== null) {
				const newPositions = [...positionsRef.current];
				newPositions[index] = [e.latlng.lat, e.latlng.lng];

				positionsRef.current = newPositions;

				setPositions(newPositions);
			}
		},

		mouseup() {
			if (!draggingRef.current.active) return;

			draggingRef.current = { active: false, index: null };

			map.dragging.enable();

			updatePolygons(positionsRef.current);

			setTimeout(() => {
				isDraggingRef.current = false;
			}, 50);
		},
	});

	const handleMouseDown = useCallback(
		(e: any, index: number | null = null) => {
			e.originalEvent.stopPropagation();

			draggingRef.current = { active: true, index };
			isDraggingRef.current = false;
			startRef.current = e.latlng;
			map.dragging.disable();
		},
		[draggingRef, isDraggingRef, startRef, map]
	);

	return (
		<>
			{currentMarker?.type === 'poly' && (
				<>
					<Polygon
						//@ts-ignore
						positions={positions}
						pathOptions={{ color: 'black' }}
						eventHandlers={{
							mousedown: (e) => handleMouseDown(e, null),
							click: (e) => e.originalEvent.stopPropagation(),
						}}
					/>

					{positions.map((pos, i) => (
						<CircleMarker
							key={i}
							center={{ lat: pos[0], lng: pos[1] }}
							radius={6}
							pathOptions={{ color: 'black', fillColor: 'black' }}
							eventHandlers={{
								mousedown: (e) => handleMouseDown(e, i),
								click: (e) => e.originalEvent.stopPropagation(),
							}}
						/>
					))}
				</>
			)}

			{currentMarker?.type === 'point' && positions.length && (
				<CircleMarker
					//@ts-ignore
					center={positions[0]}
					pathOptions={{ color: 'green' }}
					eventHandlers={{
						mousedown: (e) => handleMouseDown(e, null),
						click: (e) => e.originalEvent.stopPropagation(),
					}}
				/>
			)}
		</>
	);
};
