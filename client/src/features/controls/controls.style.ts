import styled from "@emotion/styled";

export const ControlsWrapperStyled = styled.div`
  position: absolute;
  height: 100%;

  right: 0px;
  top: 0px;

  display: flex;
  flex-direction: column;

  background-color: white;
  z-index: 100;

  padding: 16px;

  align-items: center;

  gap: 8px;

  & > * {
    width: 100%;
  }
`;

export const BottomWrapperStyled = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;

  display: flex;
  flex-direction: column;

  background-color: white;

  padding: 12px;

  gap: 8px;
  z-index: 100;
`;
