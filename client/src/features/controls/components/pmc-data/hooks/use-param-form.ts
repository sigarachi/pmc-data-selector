import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback } from "react";
import { useForm, type Control } from "react-hook-form";
import { paramSchema } from "../schema";
import type { Option } from "@university-ecosystem/ui-kit";

export interface ParamFormInputs {
  name: string;
  type: Array<Option>;
  value: string;
}

export interface UseParamForm {
  control: Control<ParamFormInputs>;
  handleSubmitForm: () => void;
}

export interface UseParamFormProps {
  onSubmit: (values: ParamFormInputs) => void;
}

export const useParamForm = (props: UseParamFormProps): UseParamForm => {
  const { onSubmit } = props;

  const { control, handleSubmit } = useForm<ParamFormInputs>({
    resolver: yupResolver(paramSchema),
    defaultValues: {
      type: [],
    },
  });

  const handleSubmitForm = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [onSubmit, handleSubmit]);

  return {
    control,
    handleSubmitForm,
  };
};
