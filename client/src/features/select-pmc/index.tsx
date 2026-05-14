import type { PMC } from '@shared/api/models/pmc';
import { PmcService } from '@shared/api/services/pmc';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Input,
	ModalWindow,
	PageLayout,
	Table,
	Text,
	useToggle,
} from '@university-ecosystem/ui-kit';
import {
	ButtonsColumnWrapperStyled,
	ContentWrapperStyled,
	ControlWrapperStyled,
	GenerationWrapperStyled,
	PageWrapperStyled,
	PaginationWrapperStyled,
} from './pmc.style';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePmcForm } from './hooks/use-pmc-form';
import { CreatePmcForm } from './form';
import { useSearch } from '@shared/hooks/use-search';
import { usePagination } from '@shared/hooks/use-pagination';
import { roundToHour } from '@shared/utils/round-time';
import { format } from 'date-fns';
import { FileService } from '@shared/api/services/file';
import type { AppFileType } from '@shared/api/models/file';
import { toast } from 'react-toastify';

export const SelectPmc = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { flag, toggleOn, toggleOff } = useToggle();
	const { search, handleSearch } = useSearch();
	const { page, pageSize, handleIncreasePage } = usePagination();

	const { data, refetch } = useQuery({
		queryKey: ['pmc-list', search, page, pageSize],
		queryFn: () =>
			PmcService.getList(page, pageSize, {
				filters: search
					? [
							{
								condition: 'contains',
								field: 'name',
								value: search,
							},
						]
					: [],
			}),
	});

	const { mutate } = useMutation({
		mutationFn: (name: string) => PmcService.create(name),
		onSuccess: async () => {
			await refetch();
			toggleOff();
		},
	});

	const { mutate: fileMutation } = useMutation({
		mutationFn: ({ id, type }: { id?: string; type: AppFileType }) =>
			FileService.generateFile(type, id),
		onSuccess: async () => {
			await queryClient.removeQueries({ queryKey: ['files'] });
			toast.success('Начата генерация файла');
			toggleOff();
		},
	});

	const handleRowClick = useCallback((row: PMC) => {
		navigate(
			`/map/${row.id}?date=${format(new Date(row.name.replace('ПМЦ ', '').split(' ')[0]), 'MM/dd/yyyy')}&time=${roundToHour(new Date(row.name.replace('ПМЦ ', '').trim())).getHours()}:00`
		);
	}, []);

	const pmcForm = usePmcForm({
		onSubmit: (values) => {
			mutate(values.name);
		},
	});

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			const key = event.key;

			if (key === 'ArrowRight' && !data?.isLastPage) {
				handleIncreasePage();
			}

			if (key === 'ArrowLeft') {
				handleIncreasePage(-1);
			}
		},
		[handleIncreasePage, data]
	);

	const handleGenerateFile = useCallback(
		(type: AppFileType, id?: string) => (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			fileMutation({ id, type });
		},
		[]
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	return (
		<PageLayout>
			<PageWrapperStyled>
				<PageLayout.Content>
					<ContentWrapperStyled>
						<ControlWrapperStyled>
							<Input
								placeholder="Поиск"
								onChange={(value) => handleSearch(String(value))}
							/>
							<GenerationWrapperStyled>
								<Text variant="body1">Массовая генерация</Text>
								<ControlWrapperStyled>
									<Button size="small" onClick={handleGenerateFile('csv')}>
										csv
									</Button>

									<Button size="small" onClick={handleGenerateFile('xlsx')}>
										xlsx
									</Button>
								</ControlWrapperStyled>
							</GenerationWrapperStyled>
						</ControlWrapperStyled>

						<Table<PMC>
							data={data?.list ?? []}
							onRowClick={handleRowClick}
							columns={[
								{
									accessor: 'name',
									title: 'Название',
									span: 1,
									render: (row) => (
										<Text variant="body1" bold>
											<>
												{new Date(String(row)).toLocaleDateString('ru-RU', {
													year: '2-digit',
													day: '2-digit',
													month: '2-digit',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</>
										</Text>
									),
								},
								{
									accessor: 'hasTracks',
									title: 'Наличие разметки',
									render: (row) => (
										<Text variant="body1">{row ? 'Есть' : 'Нет'}</Text>
									),
								},
								{
									accessor: 'id',
									title: 'Генерация',
									span: 0.1,
									render: (row) => (
										<ButtonsColumnWrapperStyled>
											<Button
												size={'small'}
												onClick={handleGenerateFile('csv', row.toString())}>
												csv
											</Button>
											<Button
												size={'small'}
												onClick={handleGenerateFile('xlsx', row.toString())}>
												xlsx
											</Button>
										</ButtonsColumnWrapperStyled>
									),
								},
							]}
						/>
						<PaginationWrapperStyled>
							{page !== 1 && (
								<Button
									size="inherit"
									onlyIcon
									icon={<>{'<'}</>}
									onClick={() => handleIncreasePage(-1)}
								/>
							)}
							<Text variant="body1" bold>
								{page}
							</Text>
							{!data?.isLastPage && (
								<Button
									size="inherit"
									onlyIcon
									icon={<>{'>'}</>}
									onClick={() => handleIncreasePage()}
								/>
							)}
						</PaginationWrapperStyled>
					</ContentWrapperStyled>
				</PageLayout.Content>
			</PageWrapperStyled>

			<ModalWindow isOpen={flag} onClose={toggleOff}>
				<ModalWindow.Header title="Добавить ПМЦ" onClose={toggleOff} />
				<ModalWindow.Content>
					<CreatePmcForm {...pmcForm} />
				</ModalWindow.Content>
				<ModalWindow.Footer
					actions={[
						{
							children: 'Добавить',
							onClick: pmcForm.handleSubmitForm,
							size: 'fullWidth',
						},
					]}
				/>
			</ModalWindow>
		</PageLayout>
	);
};
