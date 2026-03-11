import { useQuery } from '@tanstack/react-query';
import { PmcWrapperStyled } from './selector.style';
import { PmcService } from '@shared/api/services/pmc';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Text } from '@university-ecosystem/ui-kit';
import { useCallback } from 'react';

export const PmcSelector = () => {
	const navigate = useNavigate();
	const { id = '' } = useParams();

	const { data } = useQuery({
		queryKey: ['pmc', id],
		queryFn: () => PmcService.getById(id),
		enabled: Boolean(id),
	});

	const handleSelect = useCallback(() => {
		navigate('/');
	}, [navigate]);

	return (
		<PmcWrapperStyled>
			<Text variant="h6">ПМЦ</Text>
			{data && (
				<>
					<Text variant="body1">
						ПМЦ{' '}
						{new Date(data.pmc.name.replace('ПМЦ ', '')).toLocaleDateString(
							'ru-RU',
							{
								hour: '2-digit',
								minute: '2-digit',
							}
						)}
					</Text>
				</>
			)}

			<Button onClick={handleSelect}>
				{id ? 'Выбрать другой' : 'Выбрать'}
			</Button>
		</PmcWrapperStyled>
	);
};
