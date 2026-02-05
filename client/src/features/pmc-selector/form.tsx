import { Controller } from "react-hook-form";
import type { UsePmcForm } from "./hooks/use-pmc-form";
import { FormWrapperStyled } from "./selector.style";
import { Input } from "@university-ecosystem/ui-kit";

export const CreatePmcForm: React.FC<UsePmcForm> = ({ control }) => {
  return (
    <FormWrapperStyled>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            required
            label="Название"
            value={field.value}
            variant="fullwidth"
            errorText={fieldState.error?.message}
            onChange={field.onChange}
          />
        )}
      />
    </FormWrapperStyled>
  );
};
