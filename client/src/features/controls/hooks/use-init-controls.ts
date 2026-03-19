import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useInitControls = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		if (!searchParams.get('showLegend')) {
			searchParams.set('showLegend', 'true');
			setSearchParams(searchParams);
		}
		if (!searchParams.get('showTimeline')) {
			searchParams.set('showTimeline', 'true');
			setSearchParams(searchParams);
		}
		if (!searchParams.get('showRadius')) {
			searchParams.set('showRadius', 'true');
			setSearchParams(searchParams);
		}
	}, [searchParams]);
};
