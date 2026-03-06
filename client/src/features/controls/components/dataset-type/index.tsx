import { useSearchParams } from 'react-router-dom';
import { WrapperStyled } from './type.style';
import { DATASET_OPTIONS } from './constants';
import { Badge } from '@university-ecosystem/ui-kit';
import { useCallback } from 'react';
import type { DatasetType as Type } from '@shared/api/models/dataset';
import { useSettings } from '@shared/hooks/use-settings';

export const DatasetType = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const { type } = useSettings();

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
					variant={type === item.value ? 'filled' : 'outlined'}
				/>
			))}
		</WrapperStyled>
	);
};
