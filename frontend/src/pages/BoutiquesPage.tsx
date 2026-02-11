import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Search, Phone, ExternalLink, MapPin, Heart } from "lucide-react";
import { ShopCardSkeleton } from "../components/Skeleton";
import { useFavorites } from "../hooks/useFavorites";

interface Shop {
  id: number;
  name: string;
  floor: number;
  category: string;
  storeNumber: string;
  phone: string;
  url: string;
}

const FLOOR_COLORS: Record<number, string> = {
  0: "bg-green-100 text-green-800",
  1: "bg-red-100 text-red-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-green-100 text-green-800",
};

const FLOOR_NAMES: Record<number, string> = {
  0: "Level 0",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
};

export default function BoutiquesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("cat") || "all");
  const [selectedFloor, setSelectedFloor] = useState(searchParams.get("floor") || "all");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const { toggle, isFavorite } = useFavorites();

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (selectedCategory !== "all") params.cat = selectedCategory;
    if (selectedFloor !== "all") params.floor = selectedFloor;
    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, selectedFloor, setSearchParams]);

  useEffect(() => {
    apiFetch<Shop[]>("/shop").then(setShops).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(shops.map((s) => s.category).filter(Boolean))];
    return cats.sort();
  }, [shops]);

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "all" || s.category === selectedCategory;
      const matchFloor = selectedFloor === "all" || s.floor === Number(selectedFloor);
      const matchFav = !showFavOnly || isFavorite(s.id);
      return matchSearch && matchCategory && matchFloor && matchFav;
    });
  }, [shops, search, selectedCategory, selectedFloor, showFavOnly, isFavorite]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Nos Boutiques</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une boutique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-fox-orange focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-fox-orange"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-fox-orange"
        >
          <option value="all">Tous les niveaux</option>
          <option value="0">Level 0</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
        </select>
        <button
          onClick={() => setShowFavOnly(!showFavOnly)}
          className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium border transition ${
            showFavOnly ? "bg-fox-red/10 border-fox-red/30 text-fox-red" : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <Heart size={14} className={showFavOnly ? "fill-fox-red" : ""} />
          Favoris
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} boutique{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && Array.from({ length: 12 }).map((_, i) => <ShopCardSkeleton key={i} />)}
        {!loading && filtered.map((shop) => (
          <Link
            to={`/boutiques/${shop.id}`}
            key={shop.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 block"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm flex-1">{shop.name}</h3>
              <button
                onClick={(e) => { e.preventDefault(); toggle(shop.id); }}
                className="ml-2 text-gray-300 hover:text-fox-red transition shrink-0"
              >
                <Heart size={14} className={isFavorite(shop.id) ? "fill-fox-red text-fox-red" : ""} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${FLOOR_COLORS[shop.floor] || "bg-gray-100 text-gray-600"}`}>
                <MapPin size={10} className="inline mr-1" />
                {FLOOR_NAMES[shop.floor] || `Level ${shop.floor}`}
              </span>
              {shop.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-fox-orange">
                  {shop.category}
                </span>
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-500">
              {shop.phone && (
                <a href={`tel:+41${shop.phone.replace(/\s/g, "")}`} className="flex items-center gap-1 hover:text-fox-orange">
                  <Phone size={12} />
                  +41 {shop.phone}
                </a>
              )}
              {shop.url && (
                <a href={shop.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-fox-orange">
                  <ExternalLink size={12} />
                  Site officiel
                </a>
              )}
            </div>
          </Link>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Aucune boutique trouvée pour ces critères.
        </div>
      )}
    </div>
  );
}
