import { options } from '@shared/config';
import axios from 'axios';
import { toast } from 'react-toastify';

export const network = axios.create({
	baseURL: options.apiUrl,
	headers: {
		'Content-Type': 'application/json',
		'request-id': crypto.randomUUID(),
	},
	withCredentials: false,
});

network.interceptors.response.use(
	(response) => response,
	(error) => toast.error((error as Error).message)
);
