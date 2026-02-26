export type Layer = {
  id: string;
  name: string;
  date: Date;
};

export type CreateLayer = Omit<Layer, "id"> & {
  pmcId: string;
};

export type LayerListResponse = {
  layers: Array<Layer>;
};

export type LayerReponse = {
  layer: Layer;
};
