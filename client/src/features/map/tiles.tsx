import { useQuery } from '@tanstack/react-query';
import { useToggle } from '@university-ecosystem/ui-kit';
import { Fragment, useMemo, useState } from 'react';
import { CircleMarker, Popup, TileLayer } from 'react-leaflet';
import { useParams } from 'react-router-dom';

import { Drawer } from '@features/map/components/drawer';
import type { ParamFilters } from '@shared/api/models/param';
import { ParamService } from '@shared/api/services/param';
import { Loader } from '@shared/components/loader';
import { options } from '@shared/config';
import { useSettings } from '@shared/hooks/use-settings';
import { useCoordsObserver } from './hooks/use-coords-observer';

export const Tiles = () => {
	const { id = '', layerId = '' } = useParams();

	const { time, date, variable, pressure, vmax, vmin } = useSettings();

	const [filters] = useState<ParamFilters['filters']>([
		{ field: 'type', condition: 'equals', value: 'coords' },
	]);

	const params = useMemo(() => {
		const p: {
			variable: string;
			time: string;
			pressure_level: string;
			u_vmin?: string;
			u_vmax?: string;
		} = {
			variable: variable,
			time: `${date} ${time}`,
			pressure_level: pressure,
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
	}, [vmin, vmax, variable, date, time, pressure]);

	const { data } = useQuery({
		queryKey: ['pmc-params', id, filters],
		queryFn: () => ParamService.getList(id, { filters: filters }),
		enabled: Boolean(id.length),
	});

	const { flag: isLoading, toggleOn, toggleOff } = useToggle();

	useCoordsObserver();

	return (
		<>
			{isLoading && <Loader />}
			<TileLayer url="https://{s}.tile.osm.org/{z}/{x}/{y}.png" />
			{layerId && <Drawer />}
			{variable && (
				<TileLayer
					opacity={0.7}
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
				data.params.map((item) => (
					<Fragment key={item.id}>
						{item.value && (
							<CircleMarker
								key={item.id}
								center={item.value.trim().split(',').reverse()}
								pathOptions={{
									fillColor: 'white',
								}}>
								<Popup>{item.title}</Popup>
							</CircleMarker>
						)}
					</Fragment>
				))}
		</>
	);
};
