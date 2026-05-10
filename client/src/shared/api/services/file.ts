import { network } from '../common';
import type { AppFileListResponse } from '../models/file';

export class FileService {
	static async getList(): Promise<AppFileListResponse> {
		const { data } =
			await network.get<AppFileListResponse>(`/pmc-api/file/list`);

		return data;
	}

	static async generateFile(id?: string): Promise<void> {
		await network.post('/pmc-api/file/startGeneration', {
			id,
		});
	}

	static async downloadFile(id: string): Promise<void> {
		const { data } = await network.get(`/pmc-api/file/${id}/download`, {
			responseType: 'blob',
		});

		const file = new Blob([data], { type: data.type });

		const url = URL.createObjectURL(file);

		const link = document.createElement('a');

		link.href = url;
		link.download = 'file.csv';
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}
}
