import { PmcData } from "@features/pmc-data";
import { PmcSelector } from "@features/pmc-selector";
import { Timeline } from "@features/timeline";
import { Variables } from "@features/variables";
import { ControlsWrapperStyled } from "./controls.style";
import { ColorLegend } from "@features/palette";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const Controls = () => {
  const [pressure, setPressure] = useState("250");
  const [variable, setVariable] = useState<string>("u10");

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const searchPressure = searchParams.get("pressure");
    const searchVariable = searchParams.get("variable");

    if (searchVariable) {
      setVariable(searchVariable);
    }

    if (searchPressure) {
      setPressure(searchPressure);
    }
  }, [searchParams]);

  return (
    <>
      <ColorLegend pressure={Number(pressure)} variable={variable} />
      <ControlsWrapperStyled>
        <PmcSelector />
        <PmcData />
        <Variables />
      </ControlsWrapperStyled>
      <Timeline />
    </>
  );
};
