import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SelectBranch from "./pages/SelectBranch";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SelectBranch />} />
        <Route path="/:activeBrandName" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;
