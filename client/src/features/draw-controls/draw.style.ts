import styled from '@emotion/styled';

export const DrawControlsWrapperStyled = styled.div`
	height: 100%;
	width: 100%;

	right: 0px;
	top: 0px;

	display: flex;
	flex-direction: column;

	background-color: white;

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

	border: 3px solid
		${({ theme, selected }) =>
			selected ? theme.colors.primary[500] : theme.colors.grey[200]};

	background-color: ${({ selected, theme }) =>
		selected ? theme.colors.primary[300] : theme.colors.primary[200]};

	cursor: pointer;

	border-radius: 8px;

	:hover {
		background-color: ${({ theme, selected }) =>
			selected ? theme.colors.primary[400] : theme.colors.secondary[300]};
	}
`;

export const DrawButtonsWrapper = styled.div`
	display: flex;
	flex-direction: row;

	gap: 8px;
`;
