import type { AppFileStatus } from '@shared/api/models/file';
import type { StatusColorValues } from '@university-ecosystem/ui-kit';

export const AppFileStatusColorMap: Record<AppFileStatus, StatusColorValues> = {
	accepted: 'info',
	running: 'warning',
	done: 'succsess',
	error: 'error',
};
