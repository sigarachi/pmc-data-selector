import styled from "@emotion/styled";

export const DrawerControlsWrapperStyled = styled.div`
  position: absolute;
  top: 40%;
  left: 0;

  padding: 8px;

  display: flex;
  flex-direction: column;
  gap: 12px;

  z-index: 1000;
  pointer-events: auto; /* убедитесь, что это свойство установлено */
`;
