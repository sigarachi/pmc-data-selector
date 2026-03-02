import { useCallback, useState } from 'react';
import { Input, Text } from '@university-ecosystem/ui-kit';
import { PaletteWrapperStyled } from './palette.style';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LegendService } from '@shared/api/services/legend';
import { useSettings } from '@shared/hooks/use-settings';

export const ColorLegend: React.FC = () => {
	const { variable, pressure, time, date } = useSettings();

	const [searchParams, setSearchParams] = useSearchParams();
	const [vmin, setVmin] = useState<string>('');

	const [vmax, setVmax] = useState<string>('');

	const { data } = useQuery({
		queryKey: ['legend', variable, pressure, time, date, vmin, vmax],
		queryFn: () =>
			LegendService.getLegend({
				variable,
				pressure: Number(pressure),
				time: `${date} ${time}`,
				vmin,
				vmax,
			}),
		enabled: Boolean(time),
	});

	console.log('21312', searchParams.get('variable'));

	const handleChange = useCallback(
		(key: 'vmin' | 'vmax', value: string) => {
			if (key === 'vmin') {
				setVmin(value);
			} else {
				setVmax(value);
			}
			searchParams.set(key, value);
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	return (
		<PaletteWrapperStyled>
			{/* цветные блоки */}
			{data && data.colors && (
				<div style={{ display: 'flex', width: '90%' }}>
					{data.colors.map((c, i) => (
						<div key={i} style={{ flex: 1, height: 16, background: c }} />
					))}
				</div>
			)}

			{/* подписи границ */}
			{data && data.bins && (
				<div
					style={{
						display: 'flex',
						width: '90%',
						justifyContent: 'space-between',
						fontSize: 11,
					}}>
					{data.bins.map((b, i) => (
						<Text variant="body1" key={i}>
							{i !== 0 && i !== data.bins.length - 1 && <>{Math.round(b)}</>}
						</Text>
					))}
				</div>
			)}
			{data && <Text variant="body2">{data.unit}</Text>}
			<Input
				value={vmin}
				placeholder="min"
				onChange={(value) => handleChange('vmin', value.toString())}
			/>
			<Input
				value={vmax}
				placeholder="max"
				onChange={(value) => handleChange('vmax', value.toString())}
			/>
		</PaletteWrapperStyled>
	);
};
