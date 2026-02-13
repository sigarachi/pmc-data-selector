import { PmcWrapperStyled } from "@features/pmc-data/selector.style";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { PRESSURE_LEVEL, VARIABLES } from "./constants";
import { useSearchParams } from "react-router-dom";

export const Variables = (): React.ReactElement => {
  const [selected, setSelected] = useState<string>("");
  const [pressure, setPressure] = useState<string>("");

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
  }, [searchParams]);

  return (
    <PmcWrapperStyled>
      <select
        value={selected}
        onChange={(event) => handleSelect(event.target.value)}
      >
        <option value="">Выберите переменную</option>
        {VARIABLES.map((item) => (
          <option value={item.value}>{item.title}</option>
        ))}
      </select>

      {selected && (
        <select
          value={pressure}
          onChange={(event) => handlePressureSelect(event.target.value)}
        >
          <option value="">Выберите уровень давления</option>
          {PRESSURE_LEVEL.map((item) => (
            <option value={item}>{item}</option>
          ))}
        </select>
      )}
    </PmcWrapperStyled>
  );
};
