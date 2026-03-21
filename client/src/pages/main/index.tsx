import { Controls } from '@features/controls';
import { SideBar } from '@features/controls/components/sidebar';
import { MyMap } from '@features/map';
import {
	MainWrapperStyled,
	PageWrapperStyled,
} from '@shared/components/page-wrapper/page-wrapper.style';
import type React from 'react';

export const MainPage = (): React.ReactElement => {
	return (
		<PageWrapperStyled>
			<MainWrapperStyled>
				<MyMap />
				<SideBar />
			</MainWrapperStyled>
			<Controls />
		</PageWrapperStyled>
	);
};
