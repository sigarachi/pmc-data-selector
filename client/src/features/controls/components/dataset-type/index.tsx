import { useSearchParams } from 'react-router-dom';
import { WrapperStyled } from './type.style';
import { DATASET_OPTIONS } from './constants';
import { Badge } from '@university-ecosystem/ui-kit';
import { useCallback } from 'react';
import type { DatasetType as Type } from '@shared/api/models/dataset';

export const DatasetType = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const handleSelect = useCallback(
		(value: Type) => {
			searchParams.set('type', value);

			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<WrapperStyled>
			{DATASET_OPTIONS.map((item) => (
				<Badge
					text={item.title}
					onClick={() => handleSelect(item.value)}
					variant={
						searchParams.get('type') === item.value ? 'filled' : 'outlined'
					}
				/>
			))}
		</WrapperStyled>
	);
};
