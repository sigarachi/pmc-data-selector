import { useDraw } from "@shared/store/draw";
import {
  DrawButtonsWrapper,
  DrawControlsWrapperStyled,
  DrawItemStyled,
} from "./draw.style";
import { Button, Text } from "@university-ecosystem/ui-kit";
import { FaArrowLeft, FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FaDrawPolygon } from "react-icons/fa6";
import { FaMapMarkerAlt } from "react-icons/fa";

export const DrawControls = () => {
  const navigate = useNavigate();

  const {
    markers,
    addMarker,
    removeMarker,
    reset,
    currentMarkerIdx,
    setCurrentMarker,
  } = useDraw();

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
          onClick={() => addMarker({ polygons: [], type: "polygon" })}
          icon={<FaDrawPolygon />}
        >
          Добавить Полигон
        </Button>
        <Button
          size="inherit"
          onClick={() => addMarker({ polygons: [], type: "point" })}
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
          <Button
            onlyIcon
            variant="text"
            size="inherit"
            icon={<FaTrash />}
            onClick={() => removeMarker(index)}
          />
        </DrawItemStyled>
      ))}
    </DrawControlsWrapperStyled>
  );
};
