import { Outlet } from "react-router-dom";
import LanguageButton from "../components/LanguageButton";

const AppLayout = () => {
  return (
    <div className="relative">
      {/* Shared header / controls */}
      <LanguageButton />

      {/* Page content */}
      <Outlet />
    </div>
  );
};

export default AppLayout;
