import { useDraw, type StoreMarker } from "@shared/store/draw";
import {
  DrawButtonsWrapper,
  DrawControlsWrapperStyled,
  DrawItemStyled,
} from "./draw.style";
import { Button, Text } from "@university-ecosystem/ui-kit";
import { FaArrowLeft, FaTrash } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { FaDrawPolygon } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MarkerService } from "@shared/api/services/marker";
import type { CreateMarker, UpdateMarker } from "@shared/api/models/marker";

export const DrawControls = () => {
  const { layerId = "" } = useParams();
  const navigate = useNavigate();

  const { data, refetch } = useQuery({
    queryKey: ["markers", layerId],
    queryFn: () => MarkerService.getList(layerId),
  });

  const { mutate: createMutation } = useMutation({
    mutationFn: (values: CreateMarker) => MarkerService.create(values),
    onSuccess: async () => {
      await refetch();
    },
  });

  const { mutate: updateMutation } = useMutation({
    mutationFn: (values: UpdateMarker) => MarkerService.update(values),
    onSuccess: async () => {
      await refetch();
    },
  });

  const {
    markers,
    addMarker,
    removeMarker,
    setMarkers,
    reset,
    currentMarkerIdx,
    setCurrentMarker,
  } = useDraw();

  const handleSave = useCallback(
    (marker: StoreMarker) => {
      const markerId = marker?.id;
      if (markerId) {
        updateMutation({ ...marker, id: markerId });
        return;
      }

      createMutation({ ...marker, layerId });
    },
    [layerId, updateMutation, createMutation],
  );

  useEffect(() => {
    if (data?.markers) {
      setMarkers(data.markers);
    }
  }, [data, setMarkers]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return (
    <DrawControlsWrapperStyled>
      <Button icon={<FaArrowLeft />} onClick={() => navigate(-1)}>
        Назад
      </Button>
      <DrawButtonsWrapper>
        <Button
          size="inherit"
          onClick={() => addMarker({ polygons: [], type: "poly", name: "" })}
          icon={<FaDrawPolygon />}
        >
          Добавить Полигон
        </Button>
        <Button
          size="inherit"
          onClick={() => addMarker({ polygons: [], type: "point", name: "" })}
          icon={<FaMapMarkerAlt />}
        >
          Добавить Точку
        </Button>
      </DrawButtonsWrapper>
      <Text variant="body1" bold>
        Элементы
      </Text>
      {markers.map((item, index) => (
        <DrawItemStyled
          selected={index === currentMarkerIdx}
          onClick={() => setCurrentMarker(index)}
        >
          {item.type}
          <DrawButtonsWrapper>
            <Button
              variant="text"
              size="inherit"
              onClick={() => handleSave(item)}
              onlyIcon
              icon={<FaSave />}
            ></Button>
            <Button
              onlyIcon
              variant="text"
              size="inherit"
              icon={<FaTrash />}
              onClick={() => removeMarker(index)}
            />
          </DrawButtonsWrapper>
        </DrawItemStyled>
      ))}
    </DrawControlsWrapperStyled>
  );
};
