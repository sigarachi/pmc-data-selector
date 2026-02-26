import { Controls } from "@features/controls";
import { MyMap } from "@features/map";
import { PageWrapperStyled } from "@shared/components/page-wrapper/page-wrapper.style";
import type React from "react";
import { Outlet } from "react-router-dom";

export const MainPage = (): React.ReactElement => {
  return (
    <PageWrapperStyled>
      <MyMap />
      <Controls />
    </PageWrapperStyled>
  );
};
