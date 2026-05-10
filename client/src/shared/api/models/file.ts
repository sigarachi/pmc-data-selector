export type AppFileStatus = 'accepted' | 'running' | 'done' | 'error';

export interface AppFile {
	id: string;
	name: string;
	generationDate: Date;
	status: AppFileStatus;
	path: string;
}

export const AppFileDictionary: Record<AppFileStatus, string> = {
	accepted: 'Зарегестрирован в системе',
	running: 'В процессе',
	error: 'Ошибка при генерации',
	done: 'Готов',
};

export interface AppFileListResponse {
	files: Array<AppFile>;
}
