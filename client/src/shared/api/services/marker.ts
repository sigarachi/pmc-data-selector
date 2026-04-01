import { network } from '../common';
import type {
	CreateMarker,
	MarkerFilters,
	MarkerListResponse,
	MarkerResponse,
	UpdateMarker,
} from '../models/marker';

export class MarkerService {
	static async getList(
		pmcId: string,
		filters?: MarkerFilters
	): Promise<MarkerListResponse> {
		const { data } = await network.post<MarkerListResponse>(
			`/pmc-api/marker/list/${pmcId}`,
			filters
		);

		return data;
	}

	static async getById(id: string): Promise<MarkerResponse> {
		const { data } = await network.get<MarkerResponse>(`/pmc-api/marker/${id}`);

		return data;
	}

	static async create(args: CreateMarker): Promise<void> {
		await network.post(`/pmc-api/marker`, args);
	}

	static async update(args: UpdateMarker): Promise<void> {
		const { id, ...rest } = args;

		await network.patch(`/pmc-api/marker/${id}`, rest);
	}

	static async delete(id: string): Promise<void> {
		await network.delete(`/pmc-api/marker/${id}`);
	}
}
