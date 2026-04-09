import styled from '@emotion/styled';

export const ControlsWrapperStyled = styled.div<{ opened: boolean }>`
	height: 100%;

	display: flex;
	flex-direction: column;

	${({ opened }) => opened && `min-width: 350px;`}

	background-color: white;

	padding: 16px;

	align-items: center;

	overflow-y: auto;

	gap: 8px;

	& > * {
		width: 100%;
	}
`;

export const BottomWrapperStyled = styled.div`
	width: 100%;

	display: flex;
	flex-direction: column;

	background-color: white;

	padding: 12px;

	gap: 8px;
`;
