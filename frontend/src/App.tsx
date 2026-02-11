import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BoutiquesPage from "./pages/BoutiquesPage";
import PlanPage from "./pages/PlanPage";
import ParkingsPage from "./pages/ParkingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import RewardsPage from "./pages/RewardsPage";
import { useEffect } from "react";

function VisitorTracker() {
  useEffect(() => {
    const alreadyTracked = sessionStorage.getItem("foxtown_visited");
    if (alreadyTracked) return;
    sessionStorage.setItem("foxtown_visited", "1");
    fetch("/api/visitors/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
    }).catch(() => {});
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <VisitorTracker />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/boutiques" element={<BoutiquesPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/parkings" element={<ParkingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
