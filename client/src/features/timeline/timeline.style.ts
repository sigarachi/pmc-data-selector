import styled from "@emotion/styled";

export const TimelineWrapperStyled = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;

  background-color: white;

  padding: 20px;

  max-height: fit-content;
  height: fit-content;

  z-index: 100;

  overflow-x: auto;

  display: flex;

  & > :first-child {
    border-left: 1px solid gray;
  }

  & > * {
    flex: 1 1 0;

    text-align: center;

    border-right: 1px solid gray;

    cursor: pointer;
  }
`;
