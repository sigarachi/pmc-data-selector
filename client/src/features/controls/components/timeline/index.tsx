import { getTimeArray } from '@shared/utils/get-time-array';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
	LineWrapperStyled,
	TimelineWrapperStyled,
	TimeWrapperStyled,
} from './timeline.style';
import { Badge, Button } from '@university-ecosystem/ui-kit';
import type { TimeLineProps } from './interfaces';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ParamService } from '@shared/api/services/param';
import { getDaysArray } from '@shared/utils/get-dates-in-range';
import { getNextDay, getPreviousDay } from '@shared/utils/get-previous-date';
import { compareAsc, format } from 'date-fns';

export const Timeline: React.FC<TimeLineProps> = () => {
	const { id = '' } = useParams();

	const timeLine = useMemo(() => getTimeArray(), []);

	const [selected, setSelected] = useState<string>('');
	const [dateSelected, setDateSelected] = useState<string>('');
	const [searchParams, setSearchParams] = useSearchParams();

	const { data } = useQuery({
		queryKey: ['pmc-params', id],
		queryFn: () => ParamService.getList(id),
		enabled: Boolean(id.length),
	});

	const dateOptions = useMemo(() => {
		if (!data) {
			return [];
		}

		let formation = new Date(Date.now());
		let death: Date | null = null;
		let dates =
			data?.params
				.filter((item) => item.type === 'date')
				.map((item) => {
					if (item.name === 'datetime_formation') {
						formation = new Date(item.value.split(' ')[0]);
					}

					if (item.name === 'datetime_death') {
						death = new Date(item.value.split(' ')[0]);
					}

					return new Date(item.value.split(' ')[0]);
				}) ?? [];

		if (death) {
			dates = getDaysArray(formation, death);
		}

		const dateSet = new Set<Date>(dates);

		dateSet.add(new Date(format(getPreviousDay(formation), 'MM/dd/yyyy')));

		if (death !== null && new Date(death).getDate() === formation.getDate()) {
			dateSet.add(new Date(format(getNextDay(formation), 'MM/dd/yyyy')));
		}

		return Array.from(dateSet).sort(compareAsc);
	}, [data]);

	const handleSelect = useCallback(
		(value: string) => {
			setSelected(value);
			searchParams.set('time', value);
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	const handleSelectDate = useCallback(
		(value: string) => {
			setDateSelected(value);
			searchParams.set('date', value.split(' ')[0]);
			setSearchParams(searchParams);
		},
		[searchParams, setSearchParams]
	);

	const handleTimelineSelect = useCallback(
		(isRight: boolean) => {
			const index = timeLine.indexOf(selected);

			if (isRight) {
				if (index !== -1 && index + 1 < timeLine.length) {
					handleSelect(timeLine[index + 1]);
				} else if (index !== -1 && index + 1 >= timeLine.length) {
					handleSelect(timeLine[0]);
				}
			} else {
				if (index !== -1 && index - 1 >= 0) {
					handleSelect(timeLine[index - 1]);
				} else if (index !== -1 && index - 1 < 0) {
					handleSelect(timeLine[timeLine.length - 1]);
				}
			}
		},
		[selected, timeLine, handleSelect]
	);

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			const key = event.key;

			if (key === 'ArrowRight') {
				handleTimelineSelect(true);
			}

			if (key === 'ArrowLeft') {
				handleTimelineSelect(false);
			}
		},
		[handleTimelineSelect]
	);

	useEffect(() => {
		const searchTime = searchParams.get('time');
		if (searchTime) {
			setSelected(searchTime);
		}
	}, [searchParams]);

	useEffect(() => {
		const searchDate = searchParams.get('date');
		if (searchDate) {
			setDateSelected(searchDate);
		}
	}, [searchParams]);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	return (
		<TimelineWrapperStyled>
			{Boolean(dateOptions.length) && (
				<TimeWrapperStyled>
					{dateOptions.map((item) => (
						<Fragment key={item.getDate()}>
							<Badge
								variant={
									format(item, 'MM/dd/yyyy') === dateSelected
										? 'filled'
										: 'outlined'
								}
								text={format(new Date(item), 'dd.MM.yyyy')}
								onClick={() => handleSelectDate(format(item, 'MM/dd/yyyy'))}
							/>
						</Fragment>
					))}
				</TimeWrapperStyled>
			)}
			<LineWrapperStyled>
				<Button
					size="inherit"
					onlyIcon
					icon={<>{'<'}</>}
					onClick={() => handleTimelineSelect(false)}
				/>
				<TimeWrapperStyled>
					{timeLine.map((item) => (
						<Badge
							key={item}
							variant={item === selected ? 'filled' : 'outlined'}
							text={item}
							color="primary"
							onClick={() => handleSelect(item)}
						/>
					))}
				</TimeWrapperStyled>

				<Button
					size="inherit"
					onlyIcon
					icon={<>{'>'}</>}
					onClick={() => handleTimelineSelect(true)}
				/>
			</LineWrapperStyled>
		</TimelineWrapperStyled>
	);
};
