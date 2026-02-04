import React from "react";
import type { ParamFormProps } from "./interfaces";
import { Button, Dropdown, Input } from "@university-ecosystem/ui-kit";
import { Controller } from "react-hook-form";
import { FormWrapperStyled } from "./selector.style";
import { PARAM_TYPE_OPTIONS } from "./constants";

export const ParamForm: React.FC<ParamFormProps> = ({
  control,
  isLoading,
  handleSubmitForm,
}) => {
  return (
    <FormWrapperStyled>
      <Controller
        control={control}
        name="type"
        render={({ field, fieldState }) => (
          <Dropdown
            label="Тип"
            options={PARAM_TYPE_OPTIONS}
            value={field.value}
            onSelectOption={field.onChange}
            errorText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            required
            label="Название"
            value={field.value}
            errorText={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="value"
        render={({ field, fieldState }) => (
          <Input
            required
            label="Значение"
            value={field.value}
            errorText={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />

      <Button isLoading={isLoading} onClick={handleSubmitForm}>
        Создать
      </Button>
    </FormWrapperStyled>
  );
};
