import 'axios';

declare module 'axios' {
	interface AxiosResponseHeaders {
		'Content-Disposition': AxiosHeaderValue;
	}
}
