import type { FilteredRequest } from '../common/interfaces';

export type ParamType = 'coords' | 'number' | 'date' | 'string';

export type ParamName =
	| 'datetime_formation'
	| 'datetime_death'
	| 'formation_coords'
	| 'radius_km'
	| 'death_coords';

export type Param = {
	id: string;
	name: ParamName;
	value: string;
	title: string;
	type: ParamType;
	pmcId: string;
};

export type ParamFilters = FilteredRequest<Param, 'name' | 'value' | 'type'>;

export type CreateParam = Omit<Param, 'id'>;

export type ListReponse = {
	params: Array<Param>;
};
