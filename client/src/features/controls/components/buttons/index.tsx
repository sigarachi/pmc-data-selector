import { Button } from '@university-ecosystem/ui-kit';
import { IoTimeOutline } from 'react-icons/io5';
import { MdDataThresholding } from 'react-icons/md';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { ButtonsWrapperStyled } from './buttons.style';
import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export const Buttons = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const handleChange = useCallback(
		(key: string) => {
			searchParams.set(
				key,
				searchParams.get(key) === 'true' ? 'false' : 'true'
			);
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<ButtonsWrapperStyled>
			<Button
				icon={<IoTimeOutline />}
				size="inherit"
				onlyIcon
				onClick={() => handleChange('showTimeline')}
				variant={
					searchParams.get('showTimeline') === 'true' ? 'filled' : 'secondary'
				}
			/>
			<Button
				icon={<MdDataThresholding />}
				size="inherit"
				onlyIcon
				onClick={() => handleChange('showLegend')}
				variant={
					searchParams.get('showLegend') === 'true' ? 'filled' : 'secondary'
				}
			/>
			<Button
				icon={<HiOutlineLocationMarker />}
				size="inherit"
				onlyIcon
				onClick={() => handleChange('showRadius')}
				variant={
					searchParams.get('showRadius') === 'true' ? 'filled' : 'secondary'
				}
			/>
		</ButtonsWrapperStyled>
	);
};
