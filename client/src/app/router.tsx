import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { MainPage } from "../pages/main";
import { SelectPmcPage } from "../pages/select-pmc";
import { DrawControls } from "@features/draw-controls";
import { SideBar } from "@features/controls/components/sidebar";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="map" element={<MainPage />}>
          <Route path=":id" element={<Outlet />}>
            <Route path="" index element={<SideBar />} />
            <Route path="edit/:layerId" element={<DrawControls />} />
          </Route>
        </Route>
        <Route path="/" element={<SelectPmcPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
