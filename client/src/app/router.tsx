import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainPage } from '../pages/main';
import { SelectPmcPage } from '../pages/select-pmc';
import { FilesPage } from '../pages/files';

export const Router = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<SelectPmcPage />} />
				<Route path="/files" element={<FilesPage />} />
				<Route path="map/:id" element={<MainPage />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</BrowserRouter>
	);
};
