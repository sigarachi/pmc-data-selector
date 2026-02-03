import type { CreateParam, Param } from "@shared/api/models/param";
import { ParamService } from "@shared/api/services/param";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ParamFormInputs } from "./use-param-form";

export interface UsePmcData {
  options: Array<Param>;
  isLoading: boolean;
  handleCreateParam: (values: ParamFormInputs) => void;
}

export const usePmcData = (id: string, onSuccess: VoidFunction): UsePmcData => {
  const { data, refetch } = useQuery({
    queryKey: ["pmc-params", id],
    queryFn: () => ParamService.getList(id),
    enabled: Boolean(id.length),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (args: CreateParam) => ParamService.create(args),
    onSuccess: async () => {
      await refetch();
      onSuccess();
    },
  });

  const handleCreateParam = useCallback(
    (values: ParamFormInputs) => {
      mutate({
        pmcId: id,
        ...values,
      });
    },
    [id, mutate],
  );

  return {
    options: data?.params ?? [],
    isLoading: isPending,
    handleCreateParam,
  };
};
