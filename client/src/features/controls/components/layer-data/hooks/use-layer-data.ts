import type { CreateLayer } from "@shared/api/models/layer";
import { LayerService } from "@shared/api/services/layer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import type { LayerInputs } from "./use-layer-form";

export const useLayerData = (pmcId: string, date: Date) => {
  const { data, refetch } = useQuery({
    queryKey: ["layer-list", pmcId],
    queryFn: () => LayerService.getList(pmcId),
  });

  const { mutate: createMutation } = useMutation({
    mutationFn: (values: CreateLayer) => LayerService.create(values),
    onSuccess: async () => {
      await refetch();
    },
  });

  const { mutate: deleteMutation } = useMutation({
    mutationFn: (id: string) => LayerService.delete(id),
    onSuccess: async () => {
      await refetch();
    },
  });

  const handleCreate = useCallback(
    (values: LayerInputs) => {
      createMutation({
        ...values,
        date,
        pmcId,
      });
    },
    [createMutation, pmcId, date],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation(id);
    },
    [deleteMutation],
  );

  return {
    layers: data?.layers ?? [],
    handleCreate,
    handleDelete,
  };
};
