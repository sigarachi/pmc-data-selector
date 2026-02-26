import { ColorLegend } from "@features/controls/components/palette";
import { useEffect, useState } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { Buttons } from "./components/buttons";
import { BottomWrapperStyled } from "./controls.style";
import { Timeline } from "./components/timeline";

export const Controls = () => {
  const [pressure, setPressure] = useState("250");
  const [variable, setVariable] = useState<string>("z");

  const [searchParams] = useSearchParams();

  const hideTimeLine =
    !searchParams.get("showTimeline") ||
    searchParams.get("showTimeline") === "false";

  const hideLegend =
    !searchParams.get("showLegend") ||
    searchParams.get("showLegend") === "false";

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
      <Buttons />
      <Outlet />
      <BottomWrapperStyled>
        {!hideLegend && (
          <ColorLegend pressure={Number(pressure)} variable={variable} />
        )}
        {!hideTimeLine && <Timeline />}
      </BottomWrapperStyled>
    </>
  );
};
