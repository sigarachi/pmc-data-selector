import { MarkerService } from '@shared/api/services/marker';
import { Loader } from '@shared/components/loader';
import { useTrack } from '@shared/store/track';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const TrackData = () => {
	const { id = '' } = useParams();

	const { data, isLoading } = useQuery({
		queryKey: ['track', id],
		queryFn: () => MarkerService.getList(id),
	});

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

	return <></>;
};
