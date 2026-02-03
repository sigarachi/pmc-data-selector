import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainPage } from "../pages/main";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />}>
          <Route path=":id" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
