import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Store, Map, Car, Home, LogIn, LogOut, Settings, User, Gift } from "lucide-react";

export default function Navbar() {
  const { user, logout, isEmployee } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      // Sur mobile, le bouton "Compte" et le panneau font partie de la même zone interactive.
      const clickedInsideMobileMenu = mobileUserMenuRef.current?.contains(e.target as Node);
      const clickedMobileToggle = mobileUserToggleRef.current?.contains(e.target as Node);
      if (!clickedInsideMobileMenu && !clickedMobileToggle) {
        setMobileUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path ? "text-white font-bold border-b-2 border-white" : "text-white/80 hover:text-white";

  return (
    <header className={`bg-fox-orange sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
      <div className="px-6 h-16 grid grid-cols-3 items-center">
        <Link to="/" className="flex items-center justify-self-start">
          <img src="/images/foxtown-logo.png" alt="FoxTown" className="h-10" />
        </Link>

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

        <div className="hidden md:flex items-center justify-self-end">
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen((open) => !open)}
                className="text-sm text-white hover:text-white/80 flex items-center gap-1 max-w-52"
              >
                <User size={14} />
                <span className="truncate">{user.email}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
                  <Link
                    to="/rewards"
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <Gift size={14} />
                    Mes bons
                  </Link>
                  {isEmployee && (
                    <Link
                      to="/admin"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                    >
                      <Settings size={14} />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-fox-orange px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-50 transition flex items-center gap-1"
            >
              <LogIn size={14} />
              Se connecter
            </Link>
          )}
        </div>
      </div>

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
        {user ? (
          <button
            ref={mobileUserToggleRef}
            onClick={() => setMobileUserMenuOpen((open) => !open)}
            className="flex flex-col items-center text-xs text-white/80 hover:text-white"
          >
            <User size={18} />
            Compte
          </button>
        ) : (
          <Link to="/login" className={`flex flex-col items-center text-xs ${isActive("/login")}`}>
            <LogIn size={18} />
            Connexion
          </Link>
        )}
      </nav>
      {user && (
        <div
          ref={mobileUserMenuRef}
          className={`md:hidden border-t border-white/20 bg-fox-orange px-4 overflow-hidden transition-all duration-200 ease-out ${
            mobileUserMenuOpen
              ? "max-h-64 opacity-100 py-3 translate-y-0"
              : "max-h-0 opacity-0 py-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <p className="text-sm text-white/90 truncate mb-2">
            Connecté: {user.email}
          </p>
          <Link
            to="/rewards"
            className="w-full text-left px-3 py-2 text-sm rounded-md bg-white/10 text-white flex items-center gap-2 mb-2"
          >
            <Gift size={14} />
            Mes bons
          </Link>
          {isEmployee && (
            <Link
              to="/admin"
              className="w-full text-left px-3 py-2 text-sm rounded-md bg-white/10 text-white flex items-center gap-2 mb-2"
            >
              <Settings size={14} />
              Admin
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm rounded-md bg-white text-fox-orange flex items-center gap-2"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
}
