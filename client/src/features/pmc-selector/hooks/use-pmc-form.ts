import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback } from "react";
import { useForm, type Control } from "react-hook-form";
import { pmcSchema } from "../schema";

export interface PmcFormInputs {
  name: string;
}

export interface UsePmcForm {
  control: Control<PmcFormInputs>;
  handleSubmitForm: () => void;
}

export interface UsePmcFormProps {
  onSubmit: (values: PmcFormInputs) => void;
}

export const usePmcForm = (props: UsePmcFormProps): UsePmcForm => {
  const { onSubmit } = props;

  const { control, handleSubmit } = useForm<PmcFormInputs>({
    resolver: yupResolver(pmcSchema),
  });

  const handleSubmitForm = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [onSubmit, handleSubmit]);

  return {
    control,
    handleSubmitForm,
  };
};
