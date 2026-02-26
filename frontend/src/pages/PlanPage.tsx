import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { MapPin } from "lucide-react";

interface Shop {
  id: number;
  name: string;
  floor: number;
  category: string;
  storeNumber: string;
}

const LEVELS = [
  {
    id: 0,
    name: "Level 0",
    dot: "bg-green-500",
    badge: "bg-green-50 border-green-200 text-green-700",
    description: "Freddy, Le Creuset, Bally Temporary",
  },
  {
    id: 1,
    name: "Level 1",
    dot: "bg-red-500",
    badge: "bg-red-50 border-red-200 text-red-700",
    description: "Nike, Swarovski, Polo Ralph Lauren, Philipp Plein...",
  },
  {
    id: 2,
    name: "Level 2",
    dot: "bg-blue-500",
    badge: "bg-blue-50 border-blue-200 text-blue-700",
    description: "Calvin Klein, Tommy Hilfiger, Coach, Michael Kors...",
  },
  {
    id: 3,
    name: "Level 3",
    dot: "bg-emerald-600",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    description: "Prada, Versace, Burberry, Dolce & Gabbana...",
  },
];

export default function PlanPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    apiFetch<Shop[]>("/shop").then(setShops).catch(() => {});
  }, []);

  const filteredShops = selectedLevel !== null
    ? shops.filter((s) => s.floor === selectedLevel)
    : [];

  return (
    <div className="bg-white min-h-screen">
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Plan du Centre</h1>
          <p className="text-gray-500 text-sm mt-1">4 niveaux &nbsp;·&nbsp; 160 boutiques</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Level selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedLevel === level.id
                  ? `${level.badge} border`
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${level.dot}`} />
              {level.name}
            </button>
          ))}
        </div>

        {/* Shop list for selected level */}
        {selectedLevel !== null && (
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-8">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <MapPin size={15} className="text-fox-orange" />
              Boutiques — {LEVELS[selectedLevel].name}
              <span className="text-gray-400 font-normal">({filteredShops.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
              {filteredShops.map((shop) => (
                <Link
                  key={shop.id}
                  to={`/boutiques/${shop.id}`}
                  className="text-sm text-gray-600 hover:text-fox-orange transition-colors px-3 py-2 rounded-lg hover:bg-white truncate"
                >
                  {shop.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Plan images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-auto mb-6">
          <div className="text-center">
            <img
              src="/images/plan-1.png"
              alt="Plan du centre FoxTown"
              className="max-w-full h-auto mx-auto"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-auto mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Répertoire des boutiques</h2>
          <div className="text-center">
            <img
              src="/images/plan-2.png"
              alt="Répertoire des boutiques FoxTown"
              className="max-w-full h-auto mx-auto"
            />
          </div>
        </div>

        {/* Legend + Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Légende des niveaux</h3>
            <div className="space-y-2">
              {LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
                  className={`flex items-start gap-3 w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                    selectedLevel === level.id ? "bg-orange-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${level.dot}`} />
                  <div>
                    <span className="text-sm font-medium text-gray-800">{level.name}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{level.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">Informations</h3>
            <ul className="space-y-2.5">
              {[
                "160 boutiques sur 4 niveaux",
                "250 marques prestigieuses",
                "Réductions de 30% à 70% toute l'année",
                "9 bars et restaurants",
                "WiFi gratuit dans toutes les zones communes",
                "The Sense Gallery — Expérience multisensorielle",
                "Casino Admiral Mendrisio",
                "Ouvert 7j/7 de 11h à 19h",
              ].map((info) => (
                <li key={info} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-fox-orange mt-1.5 shrink-0" />
                  {info}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
