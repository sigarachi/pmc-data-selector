import styled from "@emotion/styled";

export const PmcWrapperStyled = styled.div`
  min-width: 250px;

  padding: 12px;

  border-radius: 16px;

  background-color: white;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 8px;

  z-index: 100;

  & > select {
    width: 100%;
  }
`;

export const FormWrapperStyled = styled.div`
  display: flex;
  flex-direction: column;

  gap: 8px;

  & > * {
    width: 100% !important;
  }
`;
