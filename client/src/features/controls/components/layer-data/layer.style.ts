import styled from "@emotion/styled";

export const LayerItemStyled = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 8px;

  padding: 12px 16px;

  align-items: center;
  justify-content: space-between;

  border: 1px solid ${({ theme }) => theme.colors.grey[200]};

  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.primary[300] : theme.colors.primary[100]};

  cursor: pointer;

  border-radius: 8px;

  :hover {
    background-color: ${({ theme }) => theme.colors.grey[100]};
  }
`;

export const LayerItemControlWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

export const LayerWrapperStyled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 8px;
`;

export const LayerFormWrapper = styled.div`
  display: flex;
  gap: 8px;

  align-items: flex-end;
  justify-content: center;
`;
