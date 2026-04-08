import { useDraw, type StoreMarker } from '@shared/store/draw';
import {
	DrawButtonsWrapper,
	DrawControlsWrapperStyled,
	DrawItemStyled,
} from './draw.style';
import { Button, Text } from '@university-ecosystem/ui-kit';
import { FaTrash } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { FaDrawPolygon } from 'react-icons/fa6';
import { FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import { FaSave } from 'react-icons/fa';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MarkerService } from '@shared/api/services/marker';
import type { CreateMarker, UpdateMarker } from '@shared/api/models/marker';
import { useSettings } from '@shared/hooks/use-settings';
import { toast } from 'react-toastify';
import { addHours } from 'date-fns';
import { FaChevronLeft } from 'react-icons/fa';
import { SlCursorMove } from 'react-icons/sl';
import { MdOutlineDraw } from 'react-icons/md';

export const DrawControls = () => {
	const { id = '' } = useParams();

	const { date, time } = useSettings();

	const { data, refetch } = useQuery({
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
			await refetch();
			toast.success('Маркер сохранен');
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
			await refetch();
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
		cursor,
		setCursor,
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
			createMutation({
				...marker,
				pmcId: id,
				dateTime: addHours(marker.dateTime, hours),
			});
		},
		[createMutation, id]
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
		if (data?.markers) {
			setMarkers(data.markers);
			setCurrentMarker(0);
		}
	}, [data, setMarkers, setCurrentMarker]);

	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	return (
		<DrawControlsWrapperStyled>
			<DrawButtonsWrapper>
				{!hasPoly && (
					<Button
						size="inherit"
						onClick={() =>
							addMarker({
								polygons: [],
								type: 'poly',
								name: 'Полигон',
								dateTime: new Date(`${date} ${time}`),
							})
						}
						icon={<FaDrawPolygon />}>
						Добавить Полигон
					</Button>
				)}
				{!hasPoint && (
					<Button
						size="inherit"
						onClick={() =>
							addMarker({
								polygons: [],
								type: 'point',
								name: 'Точка',
								dateTime: new Date(`${date} ${time}`),
							})
						}
						icon={<FaMapMarkerAlt />}>
						Добавить Точку
					</Button>
				)}
			</DrawButtonsWrapper>
			{currentMarker && (
				<DrawButtonsWrapper>
					<Button
						size="inherit"
						variant={cursor === 'create' ? 'filled' : 'secondary'}
						onClick={() => setCursor('create')}
						icon={<MdOutlineDraw />}>
						Создание
					</Button>
					<Button
						size="inherit"
						variant={cursor === 'drag' ? 'filled' : 'secondary'}
						onClick={() => setCursor('drag')}
						icon={<SlCursorMove />}>
						Перемещение
					</Button>
				</DrawButtonsWrapper>
			)}
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
					</div>
					<DrawButtonsWrapper>
						<Button
							variant="text"
							size="inherit"
							onClick={() => handleCreate(item, -1)}
							onlyIcon
							icon={<FaChevronLeft />}></Button>
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
						<Button
							variant="text"
							size="inherit"
							onClick={() => handleCreate(item, 1)}
							onlyIcon
							icon={<FaChevronRight />}></Button>
					</DrawButtonsWrapper>
				</DrawItemStyled>
			))}
		</DrawControlsWrapperStyled>
	);
};
