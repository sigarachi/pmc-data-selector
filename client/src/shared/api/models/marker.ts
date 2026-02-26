export type MarkerType = "point" | "poly";

export type Marker = {
  id: string;
  name: string;
  type: MarkerType;
  polygons: Array<Array<number>>;
};

export type CreateMarker = Omit<Marker, "id"> & {
  layerId: string;
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
