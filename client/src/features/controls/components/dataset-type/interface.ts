import type { DatasetType } from '@shared/api/models/dataset';
import type { Option } from '@university-ecosystem/ui-kit';

export type DatasetOption = Omit<Option, 'value' | 'id'> & {
	value: DatasetType;
};
