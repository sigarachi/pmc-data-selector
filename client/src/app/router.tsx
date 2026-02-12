import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainPage } from "../pages/main";
import { SelectPmcPage } from "../pages/select-pmc";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/map" element={<MainPage />}>
          <Route path=":id" />
        </Route>
        <Route path="/" element={<SelectPmcPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
