import { ControlsWrapperStyled } from "@features/controls/controls.style";
import { PmcSelector } from "@features/controls/components/pmc-selector";
import { Variables } from "@features/controls/components/variables";
import { Button, useToggle } from "@university-ecosystem/ui-kit";
import { ButtonWrapper } from "./sidebar.style";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { PmcData } from "../pmc-data";
import { LayerData } from "../layer-data";

export const SideBar = () => {
  const { flag, toggle } = useToggle(true);

  return (
    <ControlsWrapperStyled>
      <ButtonWrapper>
        <Button
          onlyIcon
          size="inherit"
          icon={flag ? <FaArrowRight /> : <FaArrowLeft />}
          onClick={toggle}
        />
      </ButtonWrapper>

      {flag && (
        <>
          <PmcSelector />
          <PmcData />
          <Variables />
          <LayerData />
        </>
      )}
    </ControlsWrapperStyled>
  );
};
