import { useQuery } from '@tanstack/react-query';
import { useToggle } from '@university-ecosystem/ui-kit';
import { Fragment, useMemo, useState } from 'react';
import { Circle, CircleMarker, Popup, TileLayer } from 'react-leaflet';
import { useParams, useSearchParams } from 'react-router-dom';

import { Drawer } from '@features/map/components/drawer';
import type { ParamFilters } from '@shared/api/models/param';
import { ParamService } from '@shared/api/services/param';
import { Loader } from '@shared/components/loader';
import { options } from '@shared/config';
import { useSettings } from '@shared/hooks/use-settings';
import { useCoordsObserver } from './hooks/use-coords-observer';
import { useDraw } from '@shared/store/draw';
import { useTabs } from '@shared/store/tabs';
import { TrackView } from './components/track';

export const Tiles = () => {
	const { id = '' } = useParams();
	const [searchParams] = useSearchParams();

	const hideRadius =
		!searchParams.get('showRadius') ||
		searchParams.get('showRadius') === 'false';

	const { time, date, variable, pressure, vmax, vmin, type } = useSettings();

	const { currentMarker } = useDraw();
	const { tab } = useTabs();

	const [filters] = useState<ParamFilters['filters']>([
		{ field: 'type', condition: 'equals', value: 'coords' },
	]);

	const [radiusFilters] = useState<ParamFilters['filters']>([
		{ field: 'type', condition: 'equals', value: 'string' },
	]);

	const params = useMemo(() => {
		const p: {
			variable: string;
			time: string;
			pressure_level: string;
			u_vmin?: string;
			u_vmax?: string;
			type: string;
		} = {
			variable: variable,
			time: `${date} ${time}`,
			pressure_level: pressure,
			type,
		};

		if (vmax) {
			p.u_vmax = vmax;
		} else {
			delete p.u_vmax;
		}

		if (vmin) {
			p.u_vmin = vmin;
		} else {
			delete p.u_vmin;
		}

		return p;
	}, [vmin, vmax, variable, date, time, pressure, type]);

	const { data } = useQuery({
		queryKey: ['pmc-params', id, filters],
		queryFn: () => ParamService.getList(id, { filters: filters }),
		enabled: Boolean(id.length),
	});

	const { data: radiuses } = useQuery({
		queryKey: ['pmc-params', id, radiusFilters],
		queryFn: () => ParamService.getList(id, { filters: radiusFilters }),
		enabled: Boolean(id.length),
	});

	const { flag: isLoading, toggleOn, toggleOff } = useToggle();

	const radius = useMemo(
		() => radiuses?.params.find((item) => item.name === 'radius_km'),
		[radiuses]
	);

	useCoordsObserver();

	return (
		<>
			{isLoading && <Loader />}
			<TileLayer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
			{currentMarker && tab === 'layer' && <Drawer />}
			{tab === 'track' && <TrackView />}
			{variable && (
				<TileLayer
					opacity={0.4}
					eventHandlers={{
						loading: toggleOn,
						load: toggleOff,
					}}
					url={`${options.apiUrl}/netcdf-api/tile/{z}/{x}/{y}?${new URLSearchParams(
						params
					)}`}
				/>
			)}
			{data?.params &&
				radiuses &&
				data.params.map((item) => (
					<Fragment key={item.id}>
						{item.value && (
							<CircleMarker
								key={item.id}
								//@ts-ignore
								center={item.value.trim().split(',').reverse()}
								pathOptions={{
									fillColor:
										item.name === 'formation_coords' ? 'red' : 'purple',
									color: item.name === 'formation_coords' ? 'red' : 'purple',
								}}>
								<Popup>{item.title}</Popup>
							</CircleMarker>
						)}

						{!hideRadius && radius && (
							<Circle
								//@ts-ignore
								center={item.value.trim().split(',').reverse()}
								radius={Number(radius.value) * 1000}
								pathOptions={{
									fillColor:
										item.name === 'formation_coords' ? 'red' : 'purple',
									color: item.name === 'formation_coords' ? 'red' : 'purple',
								}}
							/>
						)}
					</Fragment>
				))}
		</>
	);
};
