import styled from "@emotion/styled";

export const PmcWrapperStyled = styled.div`
  width: fit-content;

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
