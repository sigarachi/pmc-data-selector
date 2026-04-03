import styled from '@emotion/styled';

export const DrawControlsWrapperStyled = styled.div`
	height: 100%;
	width: 100%;

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

export const DrawItemStyled = styled.div<{ selected: boolean }>`
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

export const DrawButtonsWrapper = styled.div`
	display: flex;
	flex-direction: row;

	gap: 8px;
`;
