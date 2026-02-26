import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  0: "bg-green-100 text-green-700",
  1: "bg-red-100 text-red-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-emerald-100 text-emerald-700",
};

const FLOOR_NAMES: Record<number, string> = {
  0: "Level 0",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
};

export default function BoutiquesPage() {
  const navigate = useNavigate();
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
    <div className="bg-white min-h-screen">
      {/* Page header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Nos Boutiques</h1>
          <p className="text-gray-500 mt-1">160 boutiques &nbsp;·&nbsp; 250 marques</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une boutique..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fox-orange/20 focus:border-fox-orange transition"
          >
            <option value="all">Tous les niveaux</option>
            <option value="0">Level 0</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
          <button
            onClick={() => setShowFavOnly(!showFavOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
              showFavOnly
                ? "bg-red-50 border-red-200 text-fox-red"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Heart size={14} className={showFavOnly ? "fill-fox-red" : ""} />
            Favoris
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          {filtered.length} boutique{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && Array.from({ length: 12 }).map((_, i) => <ShopCardSkeleton key={i} />)}
          {!loading && filtered.map((shop) => (
            <article
              key={shop.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/boutiques/${shop.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/boutiques/${shop.id}`);
                }
              }}
              className="group bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm flex-1 leading-snug group-hover:text-fox-orange transition-colors">
                  {shop.name}
                </h3>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(shop.id); }}
                  className="ml-2 text-gray-300 hover:text-fox-red transition shrink-0 p-0.5"
                >
                  <Heart size={14} className={isFavorite(shop.id) ? "fill-fox-red text-fox-red" : ""} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FLOOR_COLORS[shop.floor] || "bg-gray-100 text-gray-600"}`}>
                  <MapPin size={9} className="inline mr-0.5 -mt-px" />
                  {FLOOR_NAMES[shop.floor] || `Level ${shop.floor}`}
                </span>
                {shop.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-fox-orange font-medium">
                    {shop.category}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-gray-400">
                {shop.phone && (
                  <a
                    href={`tel:+41${shop.phone.replace(/\s/g, "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 hover:text-fox-orange transition-colors"
                  >
                    <Phone size={11} />
                    +41 {shop.phone}
                  </a>
                )}
                {shop.url && (
                  <a
                    href={shop.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 hover:text-fox-orange transition-colors"
                  >
                    <ExternalLink size={11} />
                    Site officiel
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">Aucune boutique trouvée pour ces critères.</p>
          </div>
        )}
      </div>
    </div>
  );
}
