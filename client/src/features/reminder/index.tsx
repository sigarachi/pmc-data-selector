import { useReminder } from '@shared/store/reminder';
import { ModalWindow } from '@university-ecosystem/ui-kit';

export const Reminder = () => {
	const { isOpen, toggleOpen } = useReminder();

	return (
		<ModalWindow isOpen={isOpen} onClose={() => toggleOpen(false)}>
			<ModalWindow.Header
				title="Подтвердите действие"
				description="У вас есть несохраненные элементы, сохраните их, или они будут удалены"
				onClose={() => toggleOpen(false)}
			/>
			<ModalWindow.Footer
				actions={[
					{ children: 'Сохранить всё' },
					{
						children: 'Продолжить без сохранения',
						variant: 'secondary',
						size: 'fullWidth',
						style: { marginTop: '8px' },
					},
				]}
			/>
		</ModalWindow>
	);
};
