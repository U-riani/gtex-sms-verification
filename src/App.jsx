import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SelectBranch from "./pages/SelectBranch";
import TermsAndConditionPage from "./pages/TermsAndConditionPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/:activeBranchName" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/terms-and-conditions/:brands" element={<TermsAndConditionPage />} />
      </Routes>
    </>
  );
}

export default App;
