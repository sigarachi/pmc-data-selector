export type Param = {
  id: string;
  name: string;
  value: string;
  pmcId: string;
};

export type CreateParam = Omit<Param, "id">;

export type ListReponse = {
  params: Array<Param>;
};
