import styled from '@emotion/styled';

export const TimelineWrapperStyled = styled.div`
	width: 100%;

	max-height: fit-content;
	height: fit-content;

	display: flex;
	flex-direction: column;

	padding: 12px 8px;

	gap: 8px;
`;

export const TimeWrapperStyled = styled.div`
	width: 100%;
	gap: 8px;

	overflow-x: auto;

	display: flex;

	& > :first-child {
		border-left: 1px solid gray;
	}

	& > * {
		flex: 1 1 0;

		display: flex;

		justify-content: center;

		border-right: 1px solid gray;

		cursor: pointer;
	}
`;

export const LineWrapperStyled = styled.div`
	display: flex;
	flex-direction: row;
`;
