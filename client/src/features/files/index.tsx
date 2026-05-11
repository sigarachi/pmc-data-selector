import { useQuery } from '@tanstack/react-query';
import {
	Button,
	PageLayout,
	Status,
	Table,
	Text,
} from '@university-ecosystem/ui-kit';
import {
	ContentWrapperStyled,
	PageWrapperStyled,
	PaginationWrapperStyled,
} from './files.style';
import { FileService } from '@shared/api/services/file';
import {
	AppFileDictionary,
	type AppFile,
	type AppFileStatus,
} from '@shared/api/models/file';
import { usePagination } from '@shared/hooks/use-pagination';
import { AppFileStatusColorMap } from './constants';
import { useCallback } from 'react';

export const Files = () => {
	const { page, pageSize, handleIncreasePage } = usePagination();

	const { data, isLoading } = useQuery({
		queryKey: ['files'],
		queryFn: () => FileService.getList(page, pageSize),
	});

	const handleDownloadFile = useCallback(async (id: string) => {
		try {
			await FileService.downloadFile(id);
		} catch {}
	}, []);

	return (
		<PageLayout>
			<PageWrapperStyled>
				<PageLayout.Header title={'Файлы'} />
				<PageLayout.Content>
					<ContentWrapperStyled>
						<Table<AppFile>
							data={data?.files ?? []}
							columns={[
								{
									accessor: 'name',
									title: 'Имя',
									render: (row) => (
										<Text variant="body1" bold>
											{row.toString()}
										</Text>
									),
								},
								{
									accessor: 'generationDate',
									title: 'Дата генерации',
									render: (row) => (
										<Text variant="body1" bold>
											<>
												{new Date(row).toLocaleDateString('ru-RU', {
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
									accessor: 'status',
									title: 'Статус',
									render: (row) => (
										<Status
											status={AppFileStatusColorMap[row as AppFileStatus]}>
											{AppFileDictionary[row as AppFileStatus]}
										</Status>
									),
								},

								{
									accessor: 'id',
									title: '',
									render: (row) => (
										<Button
											size="small"
											onClick={() => handleDownloadFile(row as string)}>
											Скачать
										</Button>
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
		</PageLayout>
	);
};
