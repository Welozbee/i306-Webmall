import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../lib/api";
import { Store, Map, Car, Home, LogIn, LogOut, Settings, User, Gift, Search, X } from "lucide-react";

interface Shop {
  id: number;
  name: string;
  floor: number;
  category: string;
}

export default function Navbar() {
  const { user, logout, isEmployee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [shops, setShops] = useState<Shop[]>([]);
  const [results, setResults] = useState<Shop[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    apiFetch<Shop[]>("/shop").then(setShops).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setResults(shops.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6));
  }, [searchQuery, shops]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path ? "text-white font-bold border-b-2 border-white" : "text-white/80 hover:text-white";

  const goToShop = (id: number) => {
    navigate(`/boutiques/${id}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className={`bg-fox-orange sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
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

        {/* User actions - right (desktop only) */}
        <div className="hidden md:flex items-center justify-self-end gap-3">
          {/* Search */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-48 px-3 py-1.5 text-sm rounded-md bg-white/90 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-white/70 hover:text-white">
                  <X size={16} />
                </button>
                {results.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
                    {results.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => goToShop(shop.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 flex items-center justify-between"
                      >
                        <span>{shop.name}</span>
                        <span className="text-xs text-gray-400">Level {shop.floor}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="text-white/80 hover:text-white transition">
                <Search size={18} />
              </button>
            )}
          </div>

          {user ? (
            <>
              <span className="text-sm text-white/80">
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
              className="bg-white text-fox-orange px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-50 transition flex items-center gap-1"
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
        {user ? (
          <>
            <Link to="/rewards" className={`flex flex-col items-center text-xs ${isActive("/rewards")}`}>
              <Gift size={18} />
              Bons
            </Link>
            {isEmployee && (
              <Link to="/admin" className={`flex flex-col items-center text-xs ${isActive("/admin")}`}>
                <Settings size={18} />
                Admin
              </Link>
            )}
          </>
        ) : (
          <Link to="/login" className={`flex flex-col items-center text-xs ${isActive("/login")}`}>
            <LogIn size={18} />
            Connexion
          </Link>
        )}
      </nav>
    </header>
  );
}
