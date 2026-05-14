import { Navigation as LibNavigation } from '@university-ecosystem/ui-kit';
import { useCallback, useMemo } from 'react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

export const Navigation = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const options = useMemo(() => {
		return [
			{ text: 'Список', link: '/' },
			{ text: 'Файлы', link: '/files' },
		].map((item) => ({
			...item,
			selected: Boolean(matchPath(location.pathname, item.link)),
		}));
	}, [location]);

	const handleSelect = useCallback(
		(link: string) => {
			navigate(link);
		},
		[navigate]
	);

	return <LibNavigation options={options} onSelectOption={handleSelect} />;
};
