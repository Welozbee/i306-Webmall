import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Store, Map, Car, Home, LogIn, LogOut, Settings, Gift } from "lucide-react";

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
    const onScroll = () => setScrolled(window.scrollY > 10);
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
      const clickedInsideMobileMenu = mobileUserMenuRef.current?.contains(e.target as Node);
      const clickedMobileToggle = mobileUserToggleRef.current?.contains(e.target as Node);
      if (!clickedInsideMobileMenu && !clickedMobileToggle) {
        setMobileUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const desktopLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive(path)
        ? "text-fox-orange bg-orange-50"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`;

  const mobileLinkClass = (path: string) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-colors pt-1 pb-0.5 ${
      isActive(path) ? "text-fox-orange" : "text-gray-400 hover:text-gray-600"
    }`;

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-all duration-200 ${scrolled ? "shadow-sm" : "border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0">
            <img src="/images/foxtown-logo.png" alt="FoxTown" className="h-9" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className={desktopLinkClass("/")}>
              <Home size={15} />
              Accueil
            </Link>
            <Link to="/boutiques" className={desktopLinkClass("/boutiques")}>
              <Store size={15} />
              Boutiques
            </Link>
            <Link to="/plan" className={desktopLinkClass("/plan")}>
              <Map size={15} />
              Plan
            </Link>
            <Link to="/parkings" className={desktopLinkClass("/parkings")}>
              <Car size={15} />
              Parkings
            </Link>
          </nav>

          {/* Desktop user menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors max-w-52"
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-fox-orange text-xs font-semibold shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{user.email}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <Link
                      to="/rewards"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Gift size={15} className="text-gray-400" />
                      Mes récompenses
                    </Link>
                    {isEmployee && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={15} className="text-gray-400" />
                        Administration
                      </Link>
                    )}
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-fox-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <LogIn size={15} />
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile header: user avatar or login button */}
          <div className="flex md:hidden items-center">
            {user ? (
              <button
                ref={mobileUserToggleRef}
                onClick={() => setMobileUserMenuOpen((open) => !open)}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                  mobileUserMenuOpen
                    ? "bg-fox-orange text-white"
                    : "bg-orange-100 text-fox-orange"
                }`}
              >
                {user.email.charAt(0).toUpperCase()}
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 bg-fox-orange text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <LogIn size={14} />
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-2">
        <Link to="/" className={`flex-1 ${mobileLinkClass("/")}`}>
          <Home size={20} />
          Accueil
        </Link>
        <Link to="/boutiques" className={`flex-1 ${mobileLinkClass("/boutiques")}`}>
          <Store size={20} />
          Boutiques
        </Link>
        <Link to="/plan" className={`flex-1 ${mobileLinkClass("/plan")}`}>
          <Map size={20} />
          Plan
        </Link>
        <Link to="/parkings" className={`flex-1 ${mobileLinkClass("/parkings")}`}>
          <Car size={20} />
          Parkings
        </Link>
      </nav>

      {/* Mobile user dropdown (drops from top header) */}
      {user && (
        <div
          ref={mobileUserMenuRef}
          className={`md:hidden fixed top-16 right-3 z-50 w-64 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden transition-all duration-200 ease-out origin-top-right ${
            mobileUserMenuOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Connecté en tant que</p>
            <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
          </div>
          <Link
            to="/rewards"
            className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Gift size={16} className="text-gray-400" />
            Mes récompenses
          </Link>
          {isEmployee && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings size={16} className="text-gray-400" />
              Administration
            </Link>
          )}
          <div className="border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
}
