import styled from '@emotion/styled';

export const PageWrapperStyled = styled.div`
	padding: 16px 12px;
	display: flex;
	flex-direction: column;

	gap: 8px;
`;

export const FormWrapperStyled = styled.div`
	display: flex;
	flex-direction: column;

	gap: 8px;

	& > * {
		width: 100% !important;
	}
`;

export const ButtonsColumnWrapperStyled = styled.div`
	width: fit-content;

	display: flex;
	flex-direction: row;
	gap: 8px;
`;

export const PaginationWrapperStyled = styled.div`
	display: flex;
	flex-direction: row;

	align-items: center;
	justify-content: flex-end;

	gap: 8px;
`;

export const ContentWrapperStyled = styled.div`
	width: 100%;
	height: 100%;

	display: flex;
	flex-direction: column;
	gap: 12px;

	background-color: white;
	border-radius: 12px;
	padding: 16px;

	justify-content: center;
`;
