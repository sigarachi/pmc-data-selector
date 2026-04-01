import type { FilteredRequest } from '../common/interfaces';

export type MarkerType = 'point' | 'poly';

export type Marker = {
	id: string;
	name: string;
	type: MarkerType;
	dateTime: Date;
	polygons: Array<Array<number>>;
};

export type MarkerFilters = FilteredRequest<Marker, 'dateTime'>;

export type CreateMarker = Omit<Marker, 'id'> & {
	pmcId: string;
};

export type UpdateMarker = Partial<CreateMarker> & {
	id: string;
};

export type MarkerListResponse = {
	markers: Marker[];
};

export type MarkerResponse = {
	marker: Marker;
};
