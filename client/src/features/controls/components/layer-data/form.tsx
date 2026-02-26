import { Controller } from "react-hook-form";
import type { UseLayerForm } from "./hooks/use-layer-form";
import { Button, Input } from "@university-ecosystem/ui-kit";
import { FaCheck } from "react-icons/fa";
import { LayerFormWrapper } from "./layer.style";

export const LayerForm: React.FC<UseLayerForm> = ({
  control,
  handleSubmit,
}) => {
  return (
    <LayerFormWrapper>
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Название"
            placeholder="ПМЦ"
            onChange={field.onChange}
            value={field.value}
          />
        )}
      />
      <Button
        onlyIcon
        size="inherit"
        icon={<FaCheck />}
        onClick={handleSubmit}
      />
    </LayerFormWrapper>
  );
};
