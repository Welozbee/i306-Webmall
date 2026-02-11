import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Store, Map, Car, Home, LogIn, LogOut, Settings, User, Gift } from "lucide-react";

export default function Navbar() {
  const { user, logout, isEmployee } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? "text-white font-bold border-b-2 border-white" : "text-white/80 hover:text-white";

  return (
    <header className="bg-fox-orange shadow-sm sticky top-0 z-50">
      <div className="px-6 h-16 grid grid-cols-3 items-center">
        {/* Logo - left */}
        <Link to="/" className="flex items-center justify-self-start">
          <img src="/images/foxtown-logo.png" alt="FoxTown" className="h-10" />
        </Link>

        {/* Nav - center */}
        <nav className="hidden md:flex items-center justify-self-center gap-6">
          <Link to="/" className={`flex items-center gap-1 py-5 text-sm font-medium transition ${isActive("/")}`}>
            <Home size={16} />
            Accueil
          </Link>
          <Link to="/boutiques" className={`flex items-center gap-1 py-5 text-sm font-medium transition ${isActive("/boutiques")}`}>
            <Store size={16} />
            Boutiques
          </Link>
          <Link to="/plan" className={`flex items-center gap-1 py-5 text-sm font-medium transition ${isActive("/plan")}`}>
            <Map size={16} />
            Plan
          </Link>
          <Link to="/parkings" className={`flex items-center gap-1 py-5 text-sm font-medium transition ${isActive("/parkings")}`}>
            <Car size={16} />
            Parkings
          </Link>
        </nav>

        {/* User actions - right */}
        <div className="flex items-center justify-self-end gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-white/80">
                <User size={14} className="inline mr-1" />
                {user.email}
              </span>
              <Link
                to="/rewards"
                className="text-sm text-white hover:underline flex items-center gap-1"
              >
                <Gift size={14} />
                Mes bons
              </Link>
              {isEmployee && (
                <Link
                  to="/admin"
                  className="text-sm text-white hover:underline flex items-center gap-1"
                >
                  <Settings size={14} />
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-white/70 hover:text-white flex items-center gap-1"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-white text-fox-orange px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition flex items-center gap-1"
            >
              <LogIn size={14} />
              Connexion
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex md:hidden justify-around pb-2 border-t border-white/20 pt-2">
        <Link to="/" className={`flex flex-col items-center text-xs ${isActive("/")}`}>
          <Home size={18} />
          Accueil
        </Link>
        <Link to="/boutiques" className={`flex flex-col items-center text-xs ${isActive("/boutiques")}`}>
          <Store size={18} />
          Boutiques
        </Link>
        <Link to="/plan" className={`flex flex-col items-center text-xs ${isActive("/plan")}`}>
          <Map size={18} />
          Plan
        </Link>
        <Link to="/parkings" className={`flex flex-col items-center text-xs ${isActive("/parkings")}`}>
          <Car size={18} />
          Parkings
        </Link>
      </nav>
    </header>
  );
}
