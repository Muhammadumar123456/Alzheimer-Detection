import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/Home";
import CognitiveTest from "./pages/CognitiveTest";
import Results from "./pages/Results";
import UploadMRI from "./pages/UploadMRI";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cognitive-test" element={<CognitiveTest />} />
          <Route path="/results" element={<Results />} />
          <Route path="/upload-mri" element={<UploadMRI />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
