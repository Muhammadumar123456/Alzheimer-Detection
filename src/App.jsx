// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Home from "./pages/Home";
// import CognitiveTest from "./pages/CognitiveTest";
// import Results from "./pages/Results";
// import UploadMRI from "./pages/UploadMRI";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/cognitive-test" element={<CognitiveTest />} />
//         <Route path="/results" element={<Results />} />
//         <Route path="/upload-mri" element={<UploadMRI />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CognitiveTest from "./pages/CognitiveTest";
import Results from "./pages/Results";
import UploadMRI from "./pages/UploadMRI";

function App() {
  return (
    <Router>
      <Routes>
        {/* DEFAULT PAGE SHOULD BE HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* MAIN APP ROUTES */}
        <Route path="/cognitive-test" element={<CognitiveTest />} />
        <Route path="/results" element={<Results />} />
        <Route path="/upload-mri" element={<UploadMRI />} />
      </Routes>
    </Router>
  );
}

export default App;
