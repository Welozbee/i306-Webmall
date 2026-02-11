import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import CookieBanner from "./components/CookieBanner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import BoutiquesPage from "./pages/BoutiquesPage";
import BoutiqueDetailPage from "./pages/BoutiqueDetailPage";
import PlanPage from "./pages/PlanPage";
import ParkingsPage from "./pages/ParkingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import RewardsPage from "./pages/RewardsPage";
import NotFoundPage from "./pages/NotFoundPage";
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
        <ToastProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-gray-50">
          <VisitorTracker />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/boutiques" element={<BoutiquesPage />} />
              <Route path="/boutiques/:id" element={<BoutiqueDetailPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/parkings" element={<ParkingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <BackToTop />
          <CookieBanner />
        </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
