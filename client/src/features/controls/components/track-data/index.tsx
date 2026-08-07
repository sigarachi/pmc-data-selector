import { MarkerService } from '@shared/api/services/marker';
import { Loader } from '@shared/components/loader';
import { useTrack } from '@shared/store/track';
import { useQuery } from '@tanstack/react-query';
import { Button, Text } from '@university-ecosystem/ui-kit';
import { format } from 'date-fns';
import { orderBy } from 'lodash';
import { useCallback, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export const TrackData = () => {
	const { id = '' } = useParams();

	const [searchParams, setSearchParams] = useSearchParams();

	const { data, isLoading } = useQuery({
		queryKey: ['track', id],
		queryFn: () => MarkerService.getList(id),
	});

	const showPoly = searchParams.get('showPoly') === 'true';

	const handleChange = useCallback(() => {
		searchParams.set(
			'showPoly',
			searchParams.get('showPoly') === 'true' ? 'false' : 'true'
		);
		setSearchParams(searchParams);
	}, [searchParams, setSearchParams]);

	const { markers, setMarkers, reset } = useTrack();

	useEffect(() => {
		if (data) {
			setMarkers(orderBy(data.markers, ['dateTime'], 'asc'));
		}
	}, [data?.markers]);

	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	if (isLoading) {
		return <Loader />;
	}

	const dates =
		markers && markers.length
			? [
					format(markers[0].dateTime, 'dd.MM.yyyy HH:mm'),
					format(markers[markers.length - 1].dateTime, 'dd.MM.yyyy HH:mm'),
				]
			: [];

	return (
		<>
			<Button onClick={handleChange} size="fullWidth">
				{showPoly ? 'Скрыть' : 'Показать'} полигоны
			</Button>
			<Text variant="body1">{'Период:'}</Text>
			<Text variant="body1">{dates.join(' - ')}</Text>
		</>
	);
};
