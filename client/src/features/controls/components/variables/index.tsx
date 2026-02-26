import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { PRESSURE_LEVEL, VARIABLES } from "./constants";
import { useSearchParams } from "react-router-dom";
import { PmcWrapperStyled } from "@features/controls/components/pmc-selector/selector.style";

export const Variables = (): React.ReactElement => {
  const [selected, setSelected] = useState<string>("z");
  const [pressure, setPressure] = useState<string>("250");

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      searchParams.set("variable", value);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const handlePressureSelect = useCallback(
    (value: string) => {
      setPressure(value);
      searchParams.set("pressure", value);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    const searchVariable = searchParams.get("variable");
    const searchPressure = searchParams.get("pressure");

    if (searchVariable) {
      setSelected(searchVariable);
    }
    if (searchPressure) {
      setPressure(searchPressure);
    }

    if (selected && !searchVariable) {
      handleSelect(selected);
    }

    if (pressure && !searchPressure) {
      handlePressureSelect(pressure);
    }
  }, [selected, pressure, searchParams]);

  return (
    <PmcWrapperStyled>
      <select
        value={selected}
        onChange={(event) => handleSelect(event.target.value)}
      >
        <option value="">Выберите переменную</option>
        {VARIABLES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.title}
          </option>
        ))}
      </select>

      {selected !== "u10" && (
        <select
          value={pressure}
          onChange={(event) => handlePressureSelect(event.target.value)}
        >
          <option value="">Выберите уровень давления</option>
          {PRESSURE_LEVEL.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      )}
    </PmcWrapperStyled>
  );
};
