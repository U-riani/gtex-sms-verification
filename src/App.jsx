import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SelectBranch from "./pages/SelectBranch";
import TermsAndConditionPage from "./pages/TermsAndConditionPage";
import AppLayout from "./layout/AppLayout";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/:activeBranchName" element={<HomePage />} />
          <Route
            path="/terms-and-conditions/:langId/:brands"
            element={<TermsAndConditionPage />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
