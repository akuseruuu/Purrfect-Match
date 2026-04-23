import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPets from "./pages/AdminPets";
import FindPets from "./pages/FindPets";
import PetProfile from "./pages/PetProfile";
import AdminAdoptionRequests from "./pages/AdminAdoptionRequests";
import Donate from "./pages/Donate";
import About from "./pages/About";
import UserProfile from "./pages/UserProfile";

function ProtectedAdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/pets" element={<FindPets />} />
        <Route path="/pets/:id" element={<PetProfile />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* Admin Routes wrapped in AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pets" element={<AdminPets />} />
          <Route path="requests" element={<AdminAdoptionRequests />} />
          <Route path="donations" element={<div className="admin-header"><h1>Donations</h1><p>Feature coming soon.</p></div>} />
          <Route path="settings" element={<div className="admin-header"><h1>Settings</h1><p>Feature coming soon.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
