import { useDraw, type StoreMarker } from '@shared/store/draw';
import {
	DrawButtonsWrapper,
	DrawControlsWrapperStyled,
	DrawItemStyled,
} from './draw.style';
import { Button, Text } from '@university-ecosystem/ui-kit';
import { FaTrash } from 'react-icons/fa6';
import { useParams, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { FaDrawPolygon } from 'react-icons/fa6';
import { FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import { FaSave } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MarkerService } from '@shared/api/services/marker';
import type {
	CreateMarker,
	MarkerType,
	UpdateMarker,
} from '@shared/api/models/marker';
import { useSettings } from '@shared/hooks/use-settings';
import { toast } from 'react-toastify';
import { addHours, formatDate } from 'date-fns';
import { FaChevronLeft } from 'react-icons/fa';
import { Loader } from '@shared/components/loader';

export const DrawControls = () => {
	const { id = '' } = useParams();
	const [searchParams, setSearchParams] = useSearchParams();

	const queryClient = useQueryClient();

	const { date, time } = useSettings();

	const { data, refetch, isLoading } = useQuery({
		queryKey: ['markers', id, date, time],
		queryFn: () =>
			MarkerService.getList(id, {
				filters: [
					{
						field: 'dateTime',
						value: new Date(`${date} ${time}`),
						condition: 'equals',
					},
				],
			}),
		enabled: Boolean(date && time),
	});

	const { mutate: createMutation } = useMutation({
		mutationFn: (values: CreateMarker) => MarkerService.create(values),
		onSuccess: async () => {
			await Promise.allSettled([
				await refetch(),
				await queryClient.removeQueries({ queryKey: ['pmc-list'] }),
			]);
			toast.success('Маркер создан');
		},
	});

	const { mutate: updateMutation } = useMutation({
		mutationFn: (values: UpdateMarker) => MarkerService.update(values),
		onSuccess: async () => {
			await refetch();
			toast.success('Маркер сохранен');
		},
	});

	const { mutate: deleteMutation } = useMutation({
		mutationFn: (itemId: string) => MarkerService.delete(itemId),
		onSuccess: async () => {
			// reset();
			await Promise.allSettled([
				await refetch(),
				await queryClient.removeQueries({ queryKey: ['pmc-list'] }),
			]);
			toast.success('Маркер удалён');
		},
	});

	const {
		markers,
		addMarker,
		removeMarker,
		setMarkers,
		reset,
		currentMarkerIdx,
		setCurrentMarker,
		currentMarker,
	} = useDraw();

	const hasPoly = Boolean(markers.find((item) => item.type === 'poly'));

	const hasPoint = Boolean(markers.find((item) => item.type === 'point'));

	const handleSave = useCallback(
		(marker: StoreMarker) => {
			const markerId = marker?.id;
			if (markerId) {
				updateMutation({ ...marker, id: markerId });
				return;
			}

			createMutation({ ...marker, pmcId: id });
		},
		[id, updateMutation, createMutation]
	);

	const handleCreate = useCallback(
		(marker: StoreMarker, hours: number) => {
			if ((hours === -1 || hours === 1) && !marker.id) {
				toast.error('Необходимо сохранить маркер для создания нового');
				return;
			}
			createMutation({
				...marker,
				pmcId: id,
				dateTime: addHours(marker.dateTime, hours),
			});

			const time = formatDate(addHours(marker.dateTime, hours), 'H:mm');
			const date = formatDate(addHours(marker.dateTime, hours), 'MM/dd/yyyy');

			searchParams.set('time', time);
			searchParams.set('date', date);
			setSearchParams(searchParams);
		},
		[createMutation, id, searchParams, setSearchParams]
	);

	const handleAddMarker = useCallback(
		async (type: MarkerType, dateTime: Date) => {
			await handleSave(
				addMarker({
					type,
					polygons: [],
					dateTime,
					name: type === 'poly' ? 'Полигон' : 'Точка',
				})
			);
		},
		[addMarker, handleSave]
	);

	const handleRemoveMarker = useCallback(
		async (marker: StoreMarker, index: number) => {
			if (marker.id) {
				deleteMutation(marker.id);
			}
			removeMarker(index);
		},
		[deleteMutation, removeMarker]
	);

	useEffect(() => {
		if (data) {
			setMarkers(data.markers);
		}
	}, [data?.markers.length]);

	useEffect(() => {
		if (
			!currentMarker ||
			!data?.markers.find((item) => item.id === currentMarker.id)
		) {
			setCurrentMarker(0);
		}

		if (data?.markers && !data?.markers.length && !isLoading) {
			reset();
		}
	}, [
		data,
		setMarkers,
		setCurrentMarker,
		reset,
		isLoading,
		currentMarker,
		markers,
	]);

	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	if (isLoading) return <Loader></Loader>;

	return (
		<DrawControlsWrapperStyled>
			<DrawButtonsWrapper>
				{!hasPoly && (
					<Button
						size="inherit"
						onClick={() => handleAddMarker('poly', new Date(`${date} ${time}`))}
						icon={<FaDrawPolygon />}>
						Добавить Полигон
					</Button>
				)}
				{!hasPoint && (
					<Button
						size="inherit"
						onClick={() =>
							handleAddMarker('point', new Date(`${date} ${time}`))
						}
						icon={<FaMapMarkerAlt />}>
						Добавить Точку
					</Button>
				)}
			</DrawButtonsWrapper>
			<Text variant="body1" bold>
				Элементы
			</Text>
			{markers.map((item, index) => (
				<DrawItemStyled
					selected={index === currentMarkerIdx}
					onClick={() => setCurrentMarker(index)}>
					<div>
						<Text variant="body1">{item.name}</Text>
						<Text variant="body2">
							{new Date(item.dateTime).toLocaleDateString('ru-RU', {
								hour: '2-digit',
								minute: '2-digit',
							})}
						</Text>
						<br />
						<Text variant="body2">
							Наличие разметки: {item.polygons.length ? 'есть' : 'нет'}
						</Text>
					</div>
					<DrawButtonsWrapper>
						{item.type === 'poly' && (
							<Button
								variant="text"
								size="inherit"
								onClick={() => handleCreate(item, -1)}
								onlyIcon
								icon={<FaChevronLeft />}></Button>
						)}
						<Button
							variant="text"
							size="inherit"
							onClick={() => handleSave(item)}
							onlyIcon
							icon={<FaSave />}></Button>

						<Button
							onlyIcon
							variant="text"
							size="inherit"
							icon={<FaTrash />}
							onClick={() => handleRemoveMarker(item, index)}
						/>
						{item.type === 'poly' && (
							<Button
								variant="text"
								size="inherit"
								onClick={() => handleCreate(item, 1)}
								onlyIcon
								icon={<FaChevronRight />}></Button>
						)}
					</DrawButtonsWrapper>
				</DrawItemStyled>
			))}
		</DrawControlsWrapperStyled>
	);
};
