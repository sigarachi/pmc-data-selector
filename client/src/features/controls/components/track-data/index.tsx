import { MarkerService } from '@shared/api/services/marker';
import { Loader } from '@shared/components/loader';
import { useTrack } from '@shared/store/track';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@university-ecosystem/ui-kit';
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

	const { setMarkers, reset } = useTrack();

	useEffect(() => {
		if (data) {
			setMarkers(data.markers);
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

	return (
		<>
			<Button onClick={handleChange} size="fullWidth">
				{showPoly ? 'Скрыть' : 'Показать'} полигоны
			</Button>
		</>
	);
};
