import { ControlsWrapperStyled } from '@features/controls/controls.style';
import { PmcSelector } from '@features/controls/components/pmc-selector';
import { Variables } from '@features/controls/components/variables';
import { Button, Tabs, useToggle } from '@university-ecosystem/ui-kit';
import { ButtonWrapper, TabWrapper } from './sidebar.style';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { PmcData } from '../pmc-data';
import { LayerData } from '../layer-data';
import { useState } from 'react';

export const SideBar = () => {
	const { flag, toggle } = useToggle(true);
	const [selected, setSelected] = useState<string>('data');

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
							selected={selected}
							onSelect={(tab) => setSelected(tab.value.toString())}
							options={[
								{ title: 'Данные', value: 'data' },
								{ title: 'Разметка', value: 'layer' },
							]}
						/>
					</TabWrapper>
					{selected === 'data' && <PmcData />}
					{selected === 'layer' && <LayerData />}
					<Variables />
				</>
			)}
		</ControlsWrapperStyled>
	);
};
