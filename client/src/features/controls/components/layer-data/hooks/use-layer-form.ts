import { useCallback } from "react";
import { useForm, type Control } from "react-hook-form";

export interface LayerInputs {
  name: string;
}

export interface UseLayerFormProps {
  onSubmit: (values: LayerInputs) => void;
}

export interface UseLayerForm {
  control: Control<LayerInputs>;
  handleSubmit: () => void;
}

export const useLayerForm = (props: UseLayerFormProps): UseLayerForm => {
  const { onSubmit } = props;

  const { control, handleSubmit } = useForm<LayerInputs>();

  const handleSubmitForm = useCallback(() => {
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  return {
    control,
    handleSubmit: handleSubmitForm,
  };
};
