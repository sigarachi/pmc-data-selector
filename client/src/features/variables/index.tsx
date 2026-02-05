import { PmcWrapperStyled } from "@features/pmc-data/selector.style";
import type React from "react";
import { useCallback, useState } from "react";
import { VARIABLES } from "./constants";
import { useSearchParams } from "react-router-dom";

export const Variables = (): React.ReactElement => {
  const [selected, setSelected] = useState<string>("");

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      searchParams.set("variable", value);
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  return (
    <PmcWrapperStyled>
      <select
        value={selected}
        onChange={(event) => handleSelect(event.target.value)}
      >
        <option value="">Выберите переменную</option>
        {VARIABLES.map((item) => (
          <option value={item}>{item}</option>
        ))}
      </select>
    </PmcWrapperStyled>
  );
};
