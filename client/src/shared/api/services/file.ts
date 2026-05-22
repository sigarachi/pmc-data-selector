import type { AxiosHeaderValue } from 'axios';
import { network } from '../common';
import type { AppFileListResponse, AppFileType } from '../models/file';

export class FileService {
	static async getList(
		page: number,
		pageSize: number
	): Promise<AppFileListResponse> {
		const { data } = await network.get<AppFileListResponse>(
			`/pmc-api/file/list?page=${page}&pageSize=${pageSize}`
		);

		return data;
	}

	static async generateFile(type: AppFileType, id?: string): Promise<void> {
		await network.post('/pmc-api/file/generate', {
			id,
			type,
		});
	}

	static async downloadFile(id: string): Promise<void> {
		const { data, headers } = await network.get(
			`/pmc-api/file/${id}/download`,
			{
				responseType: 'blob',
				withCredentials: true,
			}
		);

		const contentDisposition = headers[
			'content-disposition'
		] as AxiosHeaderValue;

		let fileName = '';

		if (contentDisposition && typeof contentDisposition === 'string') {
			//@ts-ignore
			fileName = contentDisposition.match(
				/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
			)[1] as string;
		}

		const file = new Blob([data], { type: data.type });

		const url = URL.createObjectURL(file);

		const link = document.createElement('a');

		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();

		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	}
}
