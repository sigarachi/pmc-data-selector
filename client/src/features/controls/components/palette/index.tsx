import { useCallback, useEffect, useState } from 'react';
import {
	Button,
	Input,
	ModalWindow,
	Text,
	useToggle,
} from '@university-ecosystem/ui-kit';
import {
	BinsWrapperStyled,
	ColorsWrapperStyled,
	InfoWrapperStyled,
	PaletteWrapperStyled,
} from './palette.style';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LegendService } from '@shared/api/services/legend';
import { useSettings } from '@shared/hooks/use-settings';
import { IoMdSettings } from 'react-icons/io';
import { VARIABLES } from '../variables/constants';

export const ColorLegend: React.FC = () => {
	const {
		variable,
		pressure,
		time,
		date,
		vmin: searchVmin,
		vmax: searchVmax,
	} = useSettings();

	const { flag, toggleOn, toggleOff } = useToggle();

	const [searchParams, setSearchParams] = useSearchParams();
	const [vmin, setVmin] = useState<string>('');

	const [vmax, setVmax] = useState<string>('');

	const { data, refetch } = useQuery({
		queryKey: [
			'legend',
			variable,
			pressure,
			time,
			date,
			searchVmin,
			searchVmax,
		],
		queryFn: () =>
			LegendService.getLegend({
				variable,
				pressure: Number(pressure),
				time: `${date} ${time}`,
				vmin: searchVmin,
				vmax: searchVmax,
			}),
		enabled: Boolean(time),
	});

	const handleChange = useCallback(
		(key: 'vmin' | 'vmax') => {
			return (value: string | number) => {
				if (key === 'vmin') {
					setVmin(value.toString());
				} else {
					setVmax(value.toString());
				}
			};
		},
		[searchParams, setSearchParams]
	);

	const handleApply = useCallback(async () => {
		searchParams.set('vmin', vmin);
		searchParams.set('vmax', vmax);

		setSearchParams(searchParams);
		await refetch();
		toggleOff();
	}, [vmin, vmax, searchParams, setSearchParams, refetch, toggleOff]);

	useEffect(() => {
		setVmin(searchVmin);
		setVmax(searchVmax);
	}, [searchVmax, searchVmin]);

	return (
		<PaletteWrapperStyled>
			<InfoWrapperStyled>
				<Text variant="body1" bold>
					{VARIABLES.find((i) => i.value === variable)?.title ?? ''}
				</Text>
				{data && data.colors && (
					<ColorsWrapperStyled>
						{data.colors.map((c, i) => (
							<div key={i} style={{ flex: 1, height: 16, background: c }} />
						))}
					</ColorsWrapperStyled>
				)}

				{data && data.bins && (
					<BinsWrapperStyled>
						{data.bins.map((b, i) => (
							<Text variant="body1" key={i}>
								{<>{Math.round(b)}</>}
							</Text>
						))}
					</BinsWrapperStyled>
				)}
				{data && <Text variant="body2">{data.unit}</Text>}
			</InfoWrapperStyled>

			<Button
				icon={<IoMdSettings />}
				size="inherit"
				onlyIcon
				onClick={toggleOn}>
				Применить
			</Button>
			<ModalWindow isOpen={flag} onClose={() => {}}>
				<ModalWindow.Header title="Настройки шкалы" onClose={toggleOff} />
				<ModalWindow.Content>
					<Input
						value={vmin}
						variant="fullwidth"
						placeholder="min"
						//@ts-ignore
						onChange={handleChange('vmin')}
					/>
					<Input
						value={vmax}
						variant="fullwidth"
						placeholder="max"
						//@ts-ignore
						onChange={handleChange('vmax')}
					/>
				</ModalWindow.Content>
				<ModalWindow.Footer
					actions={[
						{ children: 'Применить', size: 'fullWidth', onClick: handleApply },
						{
							children: 'Отмена',
							size: 'fullWidth',
							onClick: toggleOff,
							variant: 'secondary',
						},
					]}
				/>
			</ModalWindow>
		</PaletteWrapperStyled>
	);
};
