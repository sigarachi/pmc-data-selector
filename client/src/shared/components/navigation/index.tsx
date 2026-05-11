import { Navigation as LibNavigation } from '@university-ecosystem/ui-kit';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const Navigation = () => {
	const navigate = useNavigate();

	const handleSelect = useCallback(
		(link: string) => {
			navigate(link);
		},
		[navigate]
	);

	return (
		<LibNavigation
			options={[
				{ text: 'Список', link: '/' },
				{ text: 'Файлы', link: '/files' },
			]}
			onSelectOption={handleSelect}
		/>
	);
};
