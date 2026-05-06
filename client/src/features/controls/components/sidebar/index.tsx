import { ControlsWrapperStyled } from '@features/controls/controls.style';
import { PmcSelector } from '@features/controls/components/pmc-selector';
import { Variables } from '@features/controls/components/variables';
import { Button, Tabs, useToggle } from '@university-ecosystem/ui-kit';
import { ButtonWrapper, TabWrapper } from './sidebar.style';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { PmcData } from '../pmc-data';
import { LayerData } from '../layer-data';
import { useEffect } from 'react';
import { TrackData } from '../track-data';
import { useTabs, type TabValue } from '@shared/store/tabs';

export const SideBar = () => {
	const { flag, toggle } = useToggle(true);

	const { tab, setTab, reset } = useTabs();

	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	return (
		<ControlsWrapperStyled opened={flag}>
			<ButtonWrapper>
				<Button
					onlyIcon
					size="inherit"
					icon={flag ? <FaArrowRight /> : <FaArrowLeft />}
					onClick={toggle}
				/>
			</ButtonWrapper>

			{flag && (
				<>
					<PmcSelector />
					<TabWrapper>
						<Tabs
							selected={tab}
							onSelect={(tab) => setTab(tab.value.toString() as TabValue)}
							options={[
								{ title: 'Данные', value: 'data' },
								{ title: 'Разметка', value: 'layer' },
								{ title: 'Трек', value: 'track' },
							]}
						/>
					</TabWrapper>
					{tab === 'data' && <PmcData />}
					{tab === 'layer' && <LayerData />}
					{tab === 'track' && <TrackData />}
					<Variables />
				</>
			)}
		</ControlsWrapperStyled>
	);
};
