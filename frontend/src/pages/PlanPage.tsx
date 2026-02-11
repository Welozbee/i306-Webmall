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
  { id: 0, name: "Level 0", color: "bg-green-500", colorLight: "bg-green-50 border-green-200 text-green-800", description: "Freddy, Le Creuset, Bally Temporary" },
  { id: 1, name: "Level 1", color: "bg-red-500", colorLight: "bg-red-50 border-red-200 text-red-800", description: "Nike, Swarovski, Polo Ralph Lauren, Philipp Plein..." },
  { id: 2, name: "Level 2", color: "bg-blue-500", colorLight: "bg-blue-50 border-blue-200 text-blue-800", description: "Calvin Klein, Tommy Hilfiger, Coach, Michael Kors..." },
  { id: 3, name: "Level 3", color: "bg-green-600", colorLight: "bg-green-50 border-green-200 text-green-800", description: "Prada, Versace, Burberry, Dolce & Gabbana..." },
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Plan du Centre</h1>

      {/* Floor tabs */}
      <div className="flex gap-2 mb-6">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition ${
              selectedLevel === level.id
                ? level.colorLight + " border"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${level.color}`} />
            {level.name}
          </button>
        ))}
      </div>

      {/* Selected level shops */}
      {selectedLevel !== null && (
        <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin size={18} className="text-fox-orange" />
            Boutiques - {LEVELS[selectedLevel].name}
            <span className="text-sm font-normal text-gray-400">({filteredShops.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filteredShops.map((shop) => (
              <Link
                key={shop.id}
                to={`/boutiques/${shop.id}`}
                className="text-sm text-gray-700 hover:text-fox-orange transition px-3 py-2 rounded-md hover:bg-orange-50"
              >
                {shop.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Plan display */}
      <div className="bg-white rounded-lg shadow p-4 overflow-auto mb-8">
        <div className="text-center">
          <img
            src="/images/plan-1.png"
            alt="Plan du centre FoxTown"
            className="max-w-full h-auto mx-auto"
          />
        </div>
      </div>

      {/* Directory image */}
      <div className="bg-white rounded-lg shadow p-4 overflow-auto mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Répertoire des boutiques</h2>
        <div className="text-center">
          <img
            src="/images/plan-2.png"
            alt="Répertoire des boutiques FoxTown"
            className="max-w-full h-auto mx-auto"
          />
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Légende des niveaux</h3>
          <div className="space-y-3">
            {LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevel(selectedLevel === level.id ? null : level.id)}
                className={`flex items-start gap-3 w-full text-left rounded-md px-2 py-1.5 transition ${
                  selectedLevel === level.id ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded mt-0.5 shrink-0 ${level.color}`} />
                <div>
                  <span className="text-sm font-medium text-gray-700">{level.name}</span>
                  <p className="text-xs text-gray-400">{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Informations</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>160 boutiques sur 4 niveaux</li>
            <li>250 marques prestigieuses</li>
            <li>Réductions de 30% à 70% toute l'année</li>
            <li>9 bars et restaurants</li>
            <li>WiFi gratuit dans toutes les zones communes</li>
            <li>The Sense Gallery - Expérience multisensorielle</li>
            <li>Casino Admiral Mendrisio</li>
            <li>Ouvert 7j/7 de 11h à 19h</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
