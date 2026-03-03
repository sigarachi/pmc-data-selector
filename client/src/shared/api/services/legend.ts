import { network } from '../common';
import type { Legend, LegendRequest } from '../models/legend';

export class LegendService {
	static async getLegend(args: LegendRequest): Promise<Legend> {
		const { data } = await network.get<Legend>(
			`/netcdf-api/legend?variable=${args.variable}&pressure_level=${args.pressure}&time=${args.time}${args.vmin && `&vmin=${args.vmin}`}${args.vmax && `&vmax=${args.vmax}`}`
		);

		return data;
	}
}
