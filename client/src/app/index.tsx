import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from './router';
import { ThemeProvider, ecosystemTheme } from '@university-ecosystem/ui-kit';
import type { Theme } from '@emotion/react';
import { ToastContainer } from 'react-toastify';

const client = new QueryClient({
	defaultOptions: {
		queries: {
			refetchInterval: Infinity,
			staleTime: Infinity,
			refetchOnMount: false,
			retry: false,
		},
	},
});

const theme: Theme = {
	...ecosystemTheme,
	colors: {
		primary: {
			base: '#4A6FA5',
			100: '#F5F8FF',
			200: '#E1E9F5',
			300: '#B8CCE8',
			400: '#8DA8D1',
			500: '#4A6FA5',
			600: '#2E4A73',
			700: '#1A2F4A',
		},
		secondary: {
			base: '#6B8CAA',
			100: '#F0F4F9',
			200: '#DAE5F0',
			300: '#B7CBDF',
			400: '#94B0CC',
			500: '#6B8CAA',
			600: '#4A657A',
			700: '#2D4050',
		},
		tertiary: {
			base: '#9FB7C9',
			100: '#F2F6FA',
			200: '#E0E9F2',
			300: '#C4D4E3',
			400: '#9FB7C9',
			500: '#7A95AD',
			600: '#566E84',
			700: '#35495C',
		},
		quaternary: {
			base: '#B8CFE0',
			100: '#F5F9FD',
			200: '#E8F0F7',
			300: '#D4E2EF',
			400: '#B8CFE0',
			500: '#8DA9C2',
			600: '#5F7F9C',
			700: '#3B556B',
		},
		grey: {
			base: '#8F9AA7',
			100: '#F8F9FA',
			200: '#E9ECF0',
			300: '#D2D8E0',
			400: '#B5BEC9',
			500: '#8F9AA7',
			600: '#65717E',
			700: '#3C4856',
		},
		contrast: {
			base: '#D4B68A',
			300: '#E5CDAD',
			700: '#9E7B5C',
		},
		error: {
			base: '#E6A3A3',
		},
	},
};

function App() {
	return (
		<QueryClientProvider client={client}>
			<ThemeProvider theme={theme}>
				<Router />
				<ToastContainer
					position="bottom-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick={false}
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

export default App;
