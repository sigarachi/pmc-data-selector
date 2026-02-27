import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useLayerData } from "./hooks/use-layer-data";
import {
  LayerItemControlWrapper,
  LayerItemStyled,
  LayerWrapperStyled,
} from "./layer.style";
import { Button, Text, useToggle } from "@university-ecosystem/ui-kit";
import { useLayerForm, type LayerInputs } from "./hooks/use-layer-form";
import { LayerForm } from "./form";
import { useCallback } from "react";
import { FaPencil } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";

export const LayerData = () => {
  const { id = "", layerId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const { search } = useLocation();

  const navigate = useNavigate();

  const { layers, handleCreate, handleDelete } = useLayerData(
    id,
    new Date(`${searchParams.get("date")} ${searchParams.get("time")}`),
  );
  const { flag, toggle, toggleOff } = useToggle(false);

  const handleAddLayer = useCallback(
    (values: LayerInputs) => {
      handleCreate(values);
      toggleOff();
    },
    [handleCreate, toggleOff],
  );

  const handleEdit = useCallback(
    (id: string) => {
      navigate(`edit/${id}` + search);
    },
    [navigate, search],
  );

  const layerForm = useLayerForm({ onSubmit: handleAddLayer });

  return (
    <LayerWrapperStyled>
      <Text variant="body1" bold>
        Разметка
      </Text>
      {layers.map((layer) => (
        <LayerItemStyled
          selected={layer.id === layerId}
          key={layer.id}
          onClick={() => handleEdit(layer.id)}
        >
          <Text variant="body1">{layer.name}</Text>
          <Text variant="body2">
            {new Date(layer.date).toLocaleDateString("ru-RU", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <LayerItemControlWrapper>
            <Button
              onlyIcon
              variant="text"
              size="inherit"
              icon={<FaPencil />}
            />
            <Button
              onlyIcon
              variant="text"
              size="inherit"
              icon={<FaTrash />}
              onClick={() => handleDelete(layer.id)}
            />
          </LayerItemControlWrapper>
        </LayerItemStyled>
      ))}
      {flag && <LayerForm {...layerForm} />}
      <Button variant="text" onClick={toggle}>
        {flag ? "Отмена" : "Добавить"}
      </Button>
    </LayerWrapperStyled>
  );
};
