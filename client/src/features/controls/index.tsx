import { PmcData } from "@features/pmc-data";
import { PmcSelector } from "@features/pmc-selector";
import { Timeline } from "@features/timeline";
import { Variables } from "@features/variables";
import { ControlsWrapperStyled } from "./controls.style";

export const Controls = () => {
  return (
    <>
      <ControlsWrapperStyled>
        <PmcSelector />
        <PmcData />
        <Variables />
      </ControlsWrapperStyled>
      <Timeline />
    </>
  );
};
